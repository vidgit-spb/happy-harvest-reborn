import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, InviteBonus } from 'db';
import { createHash, createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  // Validate a Telegram user using the initData from Telegram Mini App
  async validateTelegramUser(initData: string): Promise<{ id: string; tgId: string } | null> {
    if (!initData) {
      return null;
    }

    try {
      // Parse the initData
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      params.delete('hash');

      // Sort parameters alphabetically
      const paramsSorted = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Validate the hash
      const botToken = this.configService.get<string>('TG_BOT_TOKEN');
      const secretKey = createHash('sha256').update(botToken).digest();
      const calculatedHash = createHmac('sha256', secretKey)
        .update(paramsSorted)
        .digest('hex');

      // Verify that the hash matches
      if (hash !== calculatedHash) {
        this.logger.warn('Invalid Telegram hash');
        return null;
      }

      // Get user data
      const user_id = params.get('user') ? JSON.parse(params.get('user')).id.toString() : null;
      
      if (!user_id) {
        this.logger.warn('No user ID in Telegram data');
        return null;
      }

      // Find or create user
      let user = await this.userRepository.findOne({ where: { tgId: user_id } });
      
      if (!user) {
        // Create new user
        const userData = params.get('user') ? JSON.parse(params.get('user')) : {};
        
        user = this.userRepository.create({
          tgId: user_id,
          username: userData.username || null,
          firstName: userData.first_name || null,
          lastName: userData.last_name || null,
        });
        
        // Check if user was invited by referrer
        const startParam = params.get('start_param') || '';
        if (startParam && startParam.startsWith('ref_')) {
          const referrerId = startParam.substring(4);
          user.referrerId = referrerId;
          
          // The invite bonus logic will be handled separately
        }
        
        await this.userRepository.save(user);
        this.logger.log(`Created new user with tgId: ${user_id}`);
      }

      return { id: user.id, tgId: user.tgId };
    } catch (error) {
      this.logger.error(`Error validating Telegram user: ${error.message}`);
      return null;
    }
  }

  // Find user by ID
  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${error.message}`);
      return null;
    }
  }

  // Get current user with active garden and bonuses
  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['gardens', 'inviteBonuses'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Find active garden (first one for now, could be changed to the last accessed one)
    const activeGarden = user.gardens.length > 0 ? user.gardens[0] : null;

    // Check for active invite bonuses
    const now = new Date();
    const activeBonuses = user.inviteBonuses.filter(
      bonus => bonus.expiresAt > now && !bonus.isConsumed
    );

    return {
      user,
      activeGarden,
      hasInviteBonus: activeBonuses.length > 0,
      activeBonuses,
    };
  }

  // Process referral and give bonuses if applicable
  async processReferral(userId: string, referrerId: string) {
    // Find the referrer
    const referrer = await this.userRepository.findOne({
      where: { id: referrerId },
      relations: ['gardens'],
    });

    if (!referrer) {
      return false;
    }

    // Count how many referrals the referrer has
    const referralsCount = await this.userRepository.count({
      where: { referrerId: referrerId },
    });

    // If the referrer has at least 2 referrals (including this one)
    if (referralsCount >= 2) {
      // Create an invite bonus for the referrer
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
      
      const inviteBonusRepo = this.userRepository.manager.getRepository(InviteBonus);
      const inviteBonus = inviteBonusRepo.create({
        userId: referrerId,
        multiplier: 2,
        expiresAt,
        reason: 'Invited 2+ friends',
      });
      
      await inviteBonusRepo.save(inviteBonus);
      
      this.logger.log(`Created invite bonus for user ${referrerId} for inviting ${referralsCount} friends`);
      
      return true;
    }

    return false;
  }
}
