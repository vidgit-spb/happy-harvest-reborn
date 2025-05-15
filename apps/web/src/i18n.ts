import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
  en: {
    translation: {
      app: {
        title: 'Happy Harvest Reborn',
        subtitle: 'The classic farm game is back!'
      },
      loading: {
        preparing_garden: 'Preparing your garden...',
        almost_ready: 'Almost ready!'
      },
      garden: {
        no_garden: 'You don\'t have a garden yet',
        create_garden_prompt: 'Create your own garden and start farming!',
        create_garden: 'Create Garden',
        expand_garden: 'Expand Garden',
        invite_friends: 'Invite friends to expand your garden further',
        garden_level: 'Garden Level'
      },
      actions: {
        plant: 'Plant',
        water: 'Water',
        harvest: 'Harvest',
        shop: 'Shop',
        social: 'Social',
        back: 'Back',
        invite_friends: 'Invite Friends',
        feed: 'Feed',
        collect: 'Collect',
        remove_weed: 'Remove Weed',
        remove_pest: 'Remove Pest',
        pet: 'Pet',
        upgrade: 'Upgrade'
      },
      currency: {
        coins: 'Coins',
        stars: 'Stars',
        xp: 'XP'
      },
      crops: {
        carrot: 'Carrot',
        tomato: 'Tomato',
        strawberry: 'Strawberry',
        potato: 'Potato',
        cabbage: 'Cabbage',
        sunflower: 'Sunflower'
      },
      trees: {
        appleTree: 'Apple Tree',
        pearTree: 'Pear Tree',
        cherryTree: 'Cherry Tree',
        lemonTree: 'Lemon Tree'
      },
      animals: {
        chicken: 'Chicken',
        cow: 'Cow',
        sheep: 'Sheep',
        pig: 'Pig',
        goat: 'Goat',
        dog: 'Guard Dog'
      },
      buildings: {
        factory: 'Factory',
        barn: 'Barn',
        silo: 'Silo',
        house: 'House',
        well: 'Well'
      },
      panels: {
        plant: {
          title: 'Select Crop to Plant'
        },
        shop: {
          title: 'Shop'
        },
        social: {
          title: 'Social'
        }
      },
      shop: {
        seeds: 'Seeds',
        animals: 'Animals',
        trees: 'Trees',
        premium: 'Premium Items',
        buy: 'Buy',
        cost: 'Cost',
        requirements: 'Requirements',
        level_required: 'Level {{level}} Required'
      },
      social: {
        invite: 'Invite Friends',
        friends: 'Friends',
        visit: 'Visit Gardens',
        leaderboard: 'Leaderboard',
        friend_bonus: 'Friend Bonus: x{{multiplier}}',
        expires_in: 'Expires in {{time}}'
      },
      time: {
        hours: 'h',
        minutes: 'm',
        seconds: 's'
      },
      errors: {
        failed_to_load: 'Failed to load game data. Please restart the app.',
        no_connection: 'Connection lost. Trying to reconnect...',
        insufficient_funds: 'Not enough {{currency}}!',
        level_required: 'Level {{level}} required!',
        action_failed: 'Action failed. Please try again.'
      },
      invite: {
        scan_qr_text: 'Scan this QR code to join my garden!',
        invite_success: 'Invite sent successfully!',
        invite_failure: 'Failed to send invite. Please try again.'
      }
    }
  },
  ru: {
    translation: {
      app: {
        title: 'Happy Harvest Reborn',
        subtitle: 'Классическая фермерская игра вернулась!'
      },
      loading: {
        preparing_garden: 'Подготовка вашего сада...',
        almost_ready: 'Почти готово!'
      },
      garden: {
        no_garden: 'У вас еще нет сада',
        create_garden_prompt: 'Создайте свой собственный сад и начните фермерство!',
        create_garden: 'Создать Сад',
        expand_garden: 'Расширить Сад',
        invite_friends: 'Пригласите друзей, чтобы расширить ваш сад',
        garden_level: 'Уровень Сада'
      },
      actions: {
        plant: 'Посадить',
        water: 'Полить',
        harvest: 'Собрать',
        shop: 'Магазин',
        social: 'Социал',
        back: 'Назад',
        invite_friends: 'Пригласить Друзей',
        feed: 'Покормить',
        collect: 'Собрать',
        remove_weed: 'Удалить Сорняк',
        remove_pest: 'Удалить Вредителя',
        pet: 'Погладить',
        upgrade: 'Улучшить'
      },
      currency: {
        coins: 'Монеты',
        stars: 'Звезды',
        xp: 'Опыт'
      },
      crops: {
        carrot: 'Морковь',
        tomato: 'Помидор',
        strawberry: 'Клубника',
        potato: 'Картофель',
        cabbage: 'Капуста',
        sunflower: 'Подсолнух'
      },
      trees: {
        appleTree: 'Яблоня',
        pearTree: 'Груша',
        cherryTree: 'Вишня',
        lemonTree: 'Лимонное дерево'
      },
      animals: {
        chicken: 'Курица',
        cow: 'Корова',
        sheep: 'Овца',
        pig: 'Свинья',
        goat: 'Коза',
        dog: 'Сторожевой Пёс'
      },
      buildings: {
        factory: 'Фабрика',
        barn: 'Амбар',
        silo: 'Силос',
        house: 'Дом',
        well: 'Колодец'
      },
      panels: {
        plant: {
          title: 'Выберите культуру для посадки'
        },
        shop: {
          title: 'Магазин'
        },
        social: {
          title: 'Социальное'
        }
      },
      shop: {
        seeds: 'Семена',
        animals: 'Животные',
        trees: 'Деревья',
        premium: 'Премиум товары',
        buy: 'Купить',
        cost: 'Стоимость',
        requirements: 'Требования',
        level_required: 'Требуется уровень {{level}}'
      },
      social: {
        invite: 'Пригласить Друзей',
        friends: 'Друзья',
        visit: 'Посетить Сады',
        leaderboard: 'Рейтинг',
        friend_bonus: 'Бонус за друзей: x{{multiplier}}',
        expires_in: 'Истекает через {{time}}'
      },
      time: {
        hours: 'ч',
        minutes: 'м',
        seconds: 'с'
      },
      errors: {
        failed_to_load: 'Не удалось загрузить данные игры. Пожалуйста, перезапустите приложение.',
        no_connection: 'Соединение потеряно. Пытаемся переподключиться...',
        insufficient_funds: 'Недостаточно {{currency}}!',
        level_required: 'Требуется уровень {{level}}!',
        action_failed: 'Действие не выполнено. Пожалуйста, попробуйте снова.'
      },
      invite: {
        scan_qr_text: 'Отсканируйте этот QR-код, чтобы присоединиться к моему саду!',
        invite_success: 'Приглашение успешно отправлено!',
        invite_failure: 'Не удалось отправить приглашение. Пожалуйста, попробуйте снова.'
      }
    }
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes by default
    },
    detection: {
      order: ['querystring', 'navigator'],
      lookupQuerystring: 'lang'
    }
  });

export default i18n;
