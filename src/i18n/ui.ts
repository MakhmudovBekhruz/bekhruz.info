export type Locale = 'en' | 'ru' | 'uz';

export const locales: Locale[] = ['en', 'ru', 'uz'];

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  uz: "O'zbekcha",
};

/** Prefix a path with the locale segment ('' for the default locale). */
export function localizePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? clean : `/${locale}${clean === '/' ? '/' : clean}`;
}

export interface Dict {
  meta: {
    title: string;
    description: string;
    projectsTitle: string;
    projectsDescription: string;
    projectTitle: (project: string) => string;
    projectDescription: (project: string) => string;
  };
  nav: {
    experience: string;
    projects: string;
    testimonials: string;
    contact: string;
  };
  hero: {
    downloadCv: string;
    contactMe: string;
    photoAlt: string;
  };
  sections: {
    skills: string;
    skillsSub: string;
    education: string;
    educationSub: string;
    experience: string;
    experienceSub: string;
    projects: string;
    projectsSub: string;
    testimonials: string;
    testimonialsSub: string;
    contact: string;
    contactSub: string;
  };
  experience: {
    present: string;
  };
  projects: {
    seeAll: string;
    appStore: string;
    playStore: string;
    live: string;
    github: string;
    backToProjects: string;
    visitSite: string;
    otherProjects: string;
  };
  contact: {
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    send: string;
    sending: string;
    success: string;
    error: string;
  };
  footer: {
    rights: string;
  };
  notFound: {
    title: string;
    body: string;
    home: string;
  };
}

export const ui: Record<Locale, Dict> = {
  en: {
    meta: {
      title: 'Bekhruz Makhmudov — CEO of norlas.com, Mobile Team Lead & Flutter Expert',
      description:
        'Bekhruz Makhmudov is the CEO of norlas.com and a Mobile Team Lead from Tashkent, Uzbekistan — a senior Flutter developer with 7+ years of experience building cross-platform mobile apps and Java (Spring Boot) backends.',
      projectsTitle: 'Projects — Bekhruz Makhmudov, Senior Flutter Developer',
      projectsDescription:
        'Mobile apps built by Bekhruz Makhmudov: banking, e-commerce, telemedicine, education and social apps built with Flutter, Firebase and Java backends.',
      projectTitle: (p) => `${p} — Flutter app by Bekhruz Makhmudov`,
      projectDescription: (p) =>
        `Case study of ${p}, a mobile app built by Bekhruz Makhmudov, Senior Flutter developer from Tashkent.`,
    },
    nav: {
      experience: 'Experience',
      projects: 'Projects',
      testimonials: 'Testimonials',
      contact: 'Contact',
    },
    hero: {
      downloadCv: 'Download CV',
      contactMe: 'Get in touch',
      photoAlt: 'Portrait of Bekhruz Makhmudov',
    },
    sections: {
      skills: 'Technical Skills',
      skillsSub: 'Technologies and tools I work with every day.',
      education: 'Education',
      educationSub: 'My academic background.',
      experience: 'Work Experience',
      experienceSub: 'My professional journey so far.',
      projects: 'Projects',
      projectsSub: 'A selection of apps I have designed and shipped.',
      testimonials: 'Testimonials',
      testimonialsSub: 'What colleagues and clients say about me.',
      contact: 'Get In Touch',
      contactSub: "Have a project in mind or just want to say hi? I'd love to hear from you.",
    },
    experience: { present: 'Present' },
    projects: {
      seeAll: 'See all projects',
      appStore: 'App Store',
      playStore: 'Google Play',
      live: 'Website',
      github: 'GitHub',
      backToProjects: 'All projects',
      visitSite: 'Visit website',
      otherProjects: 'More projects',
    },
    contact: {
      nameLabel: 'Your name',
      emailLabel: 'Your email',
      messageLabel: 'Your message',
      send: 'Send message',
      sending: 'Sending…',
      success: "Thanks! Your message is on its way — I'll get back to you soon.",
      error: 'Something went wrong. Please try again or email me directly.',
    },
    footer: {
      rights: 'All rights reserved.',
    },
    notFound: {
      title: 'Page not found',
      body: "The page you're looking for doesn't exist or has moved.",
      home: 'Back to home',
    },
  },
  ru: {
    meta: {
      title: 'Бехруз Махмудов — CEO norlas.com, Mobile Team Lead и Flutter-эксперт',
      description:
        'Бехруз Махмудов — CEO norlas.com и руководитель мобильной команды из Ташкента; senior Flutter-разработчик с опытом 7+ лет: кроссплатформенные мобильные приложения и бэкенды на Java (Spring Boot).',
      projectsTitle: 'Проекты — Бехруз Махмудов, Senior Flutter-разработчик',
      projectsDescription:
        'Мобильные приложения Бехруза Махмудова: банкинг, e-commerce, телемедицина, образование и социальные приложения на Flutter, Firebase и Java.',
      projectTitle: (p) => `${p} — Flutter-приложение Бехруза Махмудова`,
      projectDescription: (p) =>
        `Кейс ${p} — мобильное приложение, созданное Бехрузом Махмудовым, Senior Flutter-разработчиком из Ташкента.`,
    },
    nav: {
      experience: 'Опыт',
      projects: 'Проекты',
      testimonials: 'Отзывы',
      contact: 'Контакты',
    },
    hero: {
      downloadCv: 'Скачать резюме',
      contactMe: 'Связаться',
      photoAlt: 'Портрет Бехруза Махмудова',
    },
    sections: {
      skills: 'Технические навыки',
      skillsSub: 'Технологии и инструменты, с которыми я работаю каждый день.',
      education: 'Образование',
      educationSub: 'Моё академическое образование.',
      experience: 'Опыт работы',
      experienceSub: 'Мой профессиональный путь.',
      projects: 'Проекты',
      projectsSub: 'Избранные приложения, которые я спроектировал и выпустил.',
      testimonials: 'Отзывы',
      testimonialsSub: 'Что обо мне говорят коллеги и клиенты.',
      contact: 'Связаться со мной',
      contactSub: 'Есть проект или просто хотите поздороваться? Буду рад вашему сообщению.',
    },
    experience: { present: 'настоящее время' },
    projects: {
      seeAll: 'Все проекты',
      appStore: 'App Store',
      playStore: 'Google Play',
      live: 'Сайт',
      github: 'GitHub',
      backToProjects: 'Все проекты',
      visitSite: 'Открыть сайт',
      otherProjects: 'Другие проекты',
    },
    contact: {
      nameLabel: 'Ваше имя',
      emailLabel: 'Ваш email',
      messageLabel: 'Ваше сообщение',
      send: 'Отправить',
      sending: 'Отправка…',
      success: 'Спасибо! Сообщение отправлено — я скоро свяжусь с вами.',
      error: 'Что-то пошло не так. Попробуйте ещё раз или напишите мне напрямую.',
    },
    footer: {
      rights: 'Все права защищены.',
    },
    notFound: {
      title: 'Страница не найдена',
      body: 'Страница, которую вы ищете, не существует или была перемещена.',
      home: 'На главную',
    },
  },
  uz: {
    meta: {
      title: 'Behruz Mahmudov — norlas.com CEO, Mobile Team Lead va Flutter mutaxassisi',
      description:
        "Behruz Mahmudov — norlas.com CEO va Toshkentlik mobil jamoa rahbari: 7+ yillik tajribali senior Flutter dasturchi, krossplatforma mobil ilovalar va Java (Spring Boot) backendlar.",
      projectsTitle: 'Loyihalar — Behruz Mahmudov, Senior Flutter dasturchi',
      projectsDescription:
        "Behruz Mahmudov yaratgan mobil ilovalar: banking, e-commerce, telemeditsina, ta'lim va ijtimoiy ilovalar — Flutter, Firebase va Java asosida.",
      projectTitle: (p) => `${p} — Behruz Mahmudov yaratgan Flutter ilova`,
      projectDescription: (p) =>
        `${p} — Toshkentlik Senior Flutter dasturchi Behruz Mahmudov yaratgan mobil ilova haqida.`,
    },
    nav: {
      experience: 'Tajriba',
      projects: 'Loyihalar',
      testimonials: 'Fikrlar',
      contact: 'Aloqa',
    },
    hero: {
      downloadCv: 'Rezyumeni yuklab olish',
      contactMe: "Bog'lanish",
      photoAlt: 'Behruz Mahmudov portreti',
    },
    sections: {
      skills: "Texnik ko'nikmalar",
      skillsSub: 'Men har kuni ishlatadigan texnologiyalar va vositalar.',
      education: "Ta'lim",
      educationSub: "Mening akademik ma'lumotim.",
      experience: 'Ish tajribasi',
      experienceSub: 'Mening professional yo‘lim.',
      projects: 'Loyihalar',
      projectsSub: 'Men loyihalab, ishlab chiqqan ilovalardan tanlanganlari.',
      testimonials: 'Fikrlar',
      testimonialsSub: 'Hamkasblar va mijozlar men haqimda nima deydi.',
      contact: "Bog'lanish",
      contactSub: 'Loyiha g‘oyangiz bormi yoki shunchaki salom demoqchimisiz? Xabaringizni kutaman.',
    },
    experience: { present: 'hozirgacha' },
    projects: {
      seeAll: 'Barcha loyihalar',
      appStore: 'App Store',
      playStore: 'Google Play',
      live: 'Veb-sayt',
      github: 'GitHub',
      backToProjects: 'Barcha loyihalar',
      visitSite: 'Saytni ochish',
      otherProjects: 'Boshqa loyihalar',
    },
    contact: {
      nameLabel: 'Ismingiz',
      emailLabel: 'Emailingiz',
      messageLabel: 'Xabaringiz',
      send: 'Yuborish',
      sending: 'Yuborilmoqda…',
      success: 'Rahmat! Xabaringiz yuborildi — tez orada javob beraman.',
      error: "Xatolik yuz berdi. Qayta urinib ko'ring yoki menga to'g'ridan-to'g'ri yozing.",
    },
    footer: {
      rights: 'Barcha huquqlar himoyalangan.',
    },
    notFound: {
      title: 'Sahifa topilmadi',
      body: "Siz izlayotgan sahifa mavjud emas yoki ko'chirilgan.",
      home: 'Bosh sahifaga',
    },
  },
};
