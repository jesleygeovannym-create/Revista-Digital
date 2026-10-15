(function () {
  window.RevistaDigital = window.RevistaDigital || {};

  // Descripciones editoriales basadas en las páginas oficiales de cada hotel.
  // Las imágenes se mantienen en hotel-gallery-data.js y las fichas de Riviera Maya no se modifican.
  const hotelContent = {
    "Iberostar Selection Playa Mita": {
      tagline: "Pacífico, naturaleza y cultura local",
      description: "Resort frente al Pacífico en Riviera Nayarit, con playa semiprivada, tres piscinas, golf, deportes y gastronomía local e internacional.",
      tabs: {
        habitaciones: { description: "Elige entre habitaciones y suites con vistas al mar, al atardecer, al campo de golf o al jardín.", keyPoints: ["Junior Suites y suites familiares", "Opciones con vista al mar"] },
        restaurante: { description: "La propuesta combina cocina mexicana y especialidades internacionales; consulta la selección de restaurantes de esta ficha.", keyPoints: ["Sabores locales e internacionales", "Restaurantes de especialidad"] },
        piscinas: { description: "El complejo cuenta con piscina infinita, piscina infantil y parque acuático.", keyPoints: ["Tres piscinas", "Parque acuático infantil"] },
        experiencias: { description: "Disfruta de acceso directo a la playa, actividades Star Camp, tenis, buceo PADI y campo de golf.", keyPoints: ["Playa semiprivada", "Buceo PADI y golf"] }
      }
    },
    "Iberostar Waves Cozumel": {
      tagline: "Playa y buceo en el Caribe",
      description: "Resort junto a los arrecifes de Cozumel, con acceso a actividades de buceo y snorkel, playa y habitaciones con terraza.",
      tabs: {
        habitaciones: { description: "Habitaciones tropicales con terraza; algunas permiten salir directamente hacia la playa.", keyPoints: ["Terraza privada", "Opciones junto a la playa"] },
        restaurante: { description: "El resort ofrece buffet y cocina mexicana; consulta la selección de restaurantes de esta ficha.", keyPoints: ["Buffet internacional", "Cocina mexicana"] },
        piscinas: { description: "Alterna el tiempo en la playa con la piscina exterior del resort.", keyPoints: ["Piscina exterior", "Acceso a la playa"] },
        experiencias: { description: "La cercanía a los arrecifes hace del hotel una base para bucear y practicar snorkel en Cozumel.", keyPoints: ["Centro de buceo", "Arrecifes del Caribe"] }
      }
    },
    "Iberostar Selection Cancún": {
      tagline: "Villas frente al Caribe",
      description: "Resort frente a Playa Delfines con villas, diez piscinas, campo de golf, spa y restaurantes de cocina mexicana e internacional.",
      tabs: {
        habitaciones: { description: "Además de habitaciones familiares, hay villas en zonas tranquilas; algunas cuentan con piscina semiprivada.", keyPoints: ["Villas y habitaciones familiares", "Opciones con piscina semiprivada"] },
        restaurante: { description: "La oferta incluye buffet, cocina mexicana, italiana, japonesa, carnes y propuestas junto al mar; consulta la selección de esta ficha.", keyPoints: ["Cocina mexicana e internacional", "Restaurantes y bares"] },
        piscinas: { description: "El resort reúne diez piscinas, además de áreas infantiles y villas con piscina compartida semiprivada.", keyPoints: ["Diez piscinas", "Áreas infantiles"] },
        experiencias: { description: "En el complejo hay spa, golf, tenis, centro de buceo PADI, Star Camp y acceso directo a la playa.", keyPoints: ["Acceso a Playa Delfines", "Golf, spa y buceo"] }
      }
    },
    "Iberostar Selection Coral Cancún": {
      tagline: "Área exclusiva dentro del resort",
      description: "Coral Level es una sección exclusiva para adultos dentro de Iberostar Selection Cancún, con piscina privada y servicio personalizado.",
      tabs: {
        habitaciones: { description: "La sección reúne villas y habitaciones con servicios exclusivos; algunas tienen piscina semiprivada.", keyPoints: ["Área para adultos", "Villas y habitaciones exclusivas"] },
        restaurante: { description: "Disfruta las opciones gastronómicas del complejo Selection Cancún y consulta la selección de restaurantes de esta ficha.", keyPoints: ["Acceso a la oferta del resort", "Cocina mexicana e internacional"] },
        piscinas: { description: "Coral Level dispone de piscina privada y sus huéspedes pueden disfrutar de las piscinas del complejo.", keyPoints: ["Piscina privada", "Acceso a las piscinas del resort"] },
        experiencias: { description: "La estancia combina servicios personalizados con acceso a las instalaciones del resort, spa, golf y playa.", keyPoints: ["Servicio personalizado", "Acceso a Selection Cancún"] }
      }
    },
    "JOIA Rose Hall by Iberostar": {
      tagline: "Lujo frente al mar, solo adultos",
      description: "Hotel de lujo solo para adultos en Montego Bay, con suites renovadas, opciones Swim-up y Butler, spa y acceso a otros hoteles del complejo.",
      tabs: {
        habitaciones: { description: "El hotel ofrece 295 suites renovadas, incluidas categorías Swim-up y Butler.", keyPoints: ["295 suites", "Opciones Swim-up y Butler"] },
        restaurante: { description: "La gastronomía reúne restaurantes de especialidad y sabores jamaicanos; consulta la selección de esta ficha.", keyPoints: ["Restaurantes de especialidad", "Sabores de Jamaica"] },
        piscinas: { description: "Hay piscina frente al mar y suites con acceso directo al agua en categorías Swim-up.", keyPoints: ["Piscina exterior", "Suites Swim-up"] },
        experiencias: { description: "Hotel solo para adultos con spa, concierge, deportes acuáticos y acceso a otros hoteles del complejo Rose Hall.", keyPoints: ["Solo adultos", "Spa y acceso al complejo"] }
      }
    },
    "Iberostar Selection Rose Hall Suites": {
      tagline: "Suites familiares en Jamaica",
      description: "Resort todo incluido frente al mar en Montego Bay, con suites, Star Camp, splash pool, spa y acceso a Iberostar Waves Rose Hall Beach.",
      tabs: {
        habitaciones: { description: "Todas las habitaciones son suites; hay alternativas familiares y vistas al jardín, al mar o a la piscina.", keyPoints: ["Todas las habitaciones son suites", "Opciones familiares"] },
        restaurante: { description: "El complejo ofrece restaurantes de especialidad y bares; consulta la selección de esta ficha y confirma horarios con el hotel.", keyPoints: ["Restaurantes de especialidad", "Oferta compartida del complejo"] },
        piscinas: { description: "El resort cuenta con piscina y splash pool para niños, además de zonas de playa frente al hotel.", keyPoints: ["Splash pool infantil", "Acceso directo a la playa"] },
        experiencias: { description: "Star Camp, spa, deportes y acceso a instalaciones de Rose Hall Beach forman parte de la estancia.", keyPoints: ["Star Camp", "Spa y complejo compartido"] }
      }
    },
    "Coral Level at Iberostar Selection Rose Hall Suites": {
      tagline: "Servicio exclusivo en Rose Hall",
      description: "Coral Level ofrece una experiencia de mayor privacidad dentro del complejo Selection Rose Hall Suites, con servicios personalizados y acceso al resort.",
      tabs: {
        habitaciones: { description: "La categoría Coral Level ofrece espacios de estancia exclusivos dentro del complejo Rose Hall.", keyPoints: ["Categoría exclusiva", "Servicios personalizados"] },
        restaurante: { description: "La ficha muestra una selección de restaurantes del complejo; confirma con el hotel cuáles están incluidos para tu estancia.", keyPoints: ["Restaurantes del complejo", "Disponibilidad según estancia"] },
        piscinas: { description: "Los huéspedes pueden disfrutar de las áreas de piscina del complejo Rose Hall.", keyPoints: ["Piscinas del resort", "Áreas de descanso"] },
        experiencias: { description: "La experiencia integra los servicios Coral Level con las instalaciones compartidas del complejo.", keyPoints: ["Atención personalizada", "Acceso al complejo Rose Hall"] }
      }
    },
    "Iberostar Waves Rose Hall Beach": {
      tagline: "Playa y actividades en Montego Bay",
      description: "Resort todo incluido frente al mar con dos piscinas de actividades, parque acuático, spa y acceso a servicios del complejo Rose Hall.",
      tabs: {
        habitaciones: { description: "Habitaciones frente al Caribe con alternativas de vistas al jardín, a la piscina o al mar.", keyPoints: ["Vistas al Caribe", "Habitaciones familiares"] },
        restaurante: { description: "La oferta incluye buffet y restaurantes de especialidad; consulta la selección de esta ficha y los horarios oficiales.", keyPoints: ["Buffet y especialidades", "Restaurantes del complejo"] },
        piscinas: { description: "El hotel cuenta con dos piscinas de actividades y un parque acuático.", keyPoints: ["Dos piscinas de actividades", "Parque acuático"] },
        experiencias: { description: "Disfruta de acceso a la playa, spa, entretenimiento y servicios compartidos del complejo Rose Hall.", keyPoints: ["Acceso directo a la playa", "Spa y entretenimiento"] }
      }
    },
    "Iberostar Selection Bávaro Suites": {
      tagline: "Suites entre jardines y playa",
      description: "Hotel todo incluido junto a Playa Bávaro, con suites familiares, splash pool, Star Camp, spa y campo de golf de 18 hoyos.",
      tabs: {
        habitaciones: { description: "Hay suites con vista al jardín, acceso al jardín, acceso a la playa y acceso a la piscina.", keyPoints: ["Suites familiares", "Opciones con acceso a playa o piscina"] },
        restaurante: { description: "El resort cuenta con restaurantes buffet y de especialidad; consulta la selección de esta ficha y la oferta vigente del complejo.", keyPoints: ["Buffet y cocina internacional", "Restaurantes de especialidad"] },
        piscinas: { description: "El hotel ofrece piscina y splash pool infantil, además de acceso directo a Playa Bávaro.", keyPoints: ["Splash pool infantil", "Playa Bávaro"] },
        experiencias: { description: "Star Camp, spa, centro de buceo, deportes y un campo de golf de 18 hoyos amplían la estancia.", keyPoints: ["Star Camp y buceo PADI", "Golf de 18 hoyos"] }
      }
    },
    "JOIA Bávaro by Iberostar": {
      tagline: "Estancia de lujo solo para adultos",
      description: "Hotel de lujo solo para adultos en Playa Bávaro, con servicio concierge, spa, golf y acceso a restaurantes y bares de hoteles del complejo.",
      tabs: {
        habitaciones: { description: "El alojamiento incluye suites y categorías de lujo con atención personalizada.", keyPoints: ["Suites de lujo", "Servicio concierge"] },
        restaurante: { description: "La propuesta combina cinco restaurantes a la carta, buffet y una estación gourmet abierta las 24 horas; consulta la selección de esta ficha.", keyPoints: ["Cinco restaurantes a la carta", "Estación gourmet 24 horas"] },
        piscinas: { description: "Las áreas de piscina cuentan con servicio concierge; consulta con el hotel qué espacios están habilitados durante tu estancia.", keyPoints: ["Piscina con concierge", "Áreas de descanso"] },
        experiencias: { description: "El hotel ofrece spa y acceso a golf, además de restaurantes y bares de otros hoteles del complejo Bávaro.", keyPoints: ["Solo adultos", "Spa, golf y complejo Bávaro"] }
      }
    },
    "Iberostar Waves Punta Cana": {
      tagline: "Playa Bávaro y vida tropical",
      description: "Resort todo incluido frente a Playa Bávaro, con jardines tropicales, Star Camp, spa, centro de buceo, golf y laboratorio de corales.",
      tabs: {
        habitaciones: { description: "Habitaciones con balcón y opciones de vista al jardín, a la piscina o al mar.", keyPoints: ["Habitaciones con balcón", "Vistas tropicales"] },
        restaurante: { description: "La oferta incluye buffet dominicano e internacional y restaurantes temáticos; consulta la selección de esta ficha.", keyPoints: ["Buffet dominicano", "Restaurantes temáticos"] },
        piscinas: { description: "Alterna la piscina exterior con el acceso directo a la playa de Playa Bávaro.", keyPoints: ["Piscina exterior", "Acceso directo a la playa"] },
        experiencias: { description: "La estancia incluye actividades Star Camp, deportes acuáticos, centro de buceo y acceso al campo de golf de 18 hoyos del complejo.", keyPoints: ["Star Camp y deportes acuáticos", "Buceo y golf"] }
      }
    },
    "Iberostar Waves Dominicana": {
      tagline: "Caribe para disfrutar en familia",
      description: "Hotel todo incluido frente a Playa Bávaro, con jardines tropicales, restaurantes y bares, spa, golf y actividades para familias.",
      tabs: {
        habitaciones: { description: "Habitaciones con balcón y opciones de vistas tropicales para parejas y familias.", keyPoints: ["Habitaciones con balcón", "Opciones para familias"] },
        restaurante: { description: "La oferta reúne seis restaurantes temáticos, dos buffets y siete bares; consulta la selección de esta ficha.", keyPoints: ["Seis restaurantes temáticos", "Dos buffets"] },
        piscinas: { description: "Disfruta de la piscina exterior y del acceso directo a la playa de Playa Bávaro.", keyPoints: ["Piscina exterior", "Playa Bávaro"] },
        experiencias: { description: "El hotel ofrece Star Camp, spa, tenis, centro de buceo, golf y un laboratorio de corales.", keyPoints: ["Actividades familiares", "Buceo y conservación de corales"] }
      }
    },
    "Iberostar Selection Praia do Forte": {
      tagline: "Naturaleza y playa en Bahía",
      description: "Resort frente al mar dentro de una reserva natural de Bahía, con cinco piscinas, spa, campo de golf y actividades del proyecto de conservación TAMAR.",
      tabs: {
        habitaciones: { description: "Habitaciones y suites para familias, con servicios y categorías Star Prestige disponibles.", keyPoints: ["Habitaciones y suites", "Categorías Star Prestige"] },
        restaurante: { description: "La gastronomía reúne cocina bahiana y especialidades internacionales; consulta la selección de esta ficha.", keyPoints: ["Cocina local e internacional", "Restaurantes de especialidad"] },
        piscinas: { description: "El complejo cuenta con cinco piscinas, splash pool y acceso directo a la playa.", keyPoints: ["Cinco piscinas", "Splash pool infantil"] },
        experiencias: { description: "Dentro de la reserva puedes conocer el trabajo de conservación de tortugas; también hay golf, tenis, surf y Star Camp.", keyPoints: ["Conservación de tortugas TAMAR", "Golf y deportes"] }
      }
    },
    "Praia do Forte · Star Prestige": {
      tagline: "Servicios Star Prestige en Praia do Forte",
      description: "Star Prestige es una categoría de servicios y espacios preferentes en Iberostar Selection Praia do Forte, no un hotel independiente.",
      tabs: {
        habitaciones: { description: "Consulta las habitaciones y ventajas Star Prestige disponibles al reservar Iberostar Selection Praia do Forte.", keyPoints: ["Categoría del hotel Selection", "Beneficios sujetos a disponibilidad"] },
        restaurante: { description: "Los restaurantes pertenecen al hotel Selection Praia do Forte; consulta la selección y las condiciones de acceso.", keyPoints: ["Oferta del hotel Selection", "Condiciones según reserva"] },
        piscinas: { description: "Las piscinas forman parte del resort; las áreas y beneficios exclusivos dependen de la categoría contratada.", keyPoints: ["Piscinas del resort", "Acceso según categoría"] },
        experiencias: { description: "Star Prestige añade servicios y espacios preferentes dentro del hotel, sin constituir una propiedad separada.", keyPoints: ["Servicios preferentes", "Hotel Selection Praia do Forte"] }
      }
    },
    "Iberostar Waves Bahia": {
      tagline: "Hospitalidad y sabores de Bahía",
      description: "Resort todo incluido junto a la playa en Praia do Forte, con seis restaurantes, spa, piscinas, actividades familiares y zonas Star Prestige.",
      tabs: {
        habitaciones: { description: "Elige entre habitaciones y suites, con algunas categorías y servicios Star Prestige disponibles.", keyPoints: ["Habitaciones y suites", "Categorías Star Prestige"] },
        restaurante: { description: "Los restaurantes recorren sabores brasileños, cocina italiana y propuestas internacionales; consulta la selección de esta ficha.", keyPoints: ["Cocina brasileña", "Seis restaurantes"] },
        piscinas: { description: "El hotel cuenta con piscina y acceso directo a la playa; hay actividades acuáticas para familias.", keyPoints: ["Piscina exterior", "Acceso directo a la playa"] },
        experiencias: { description: "Disfruta de spa, actividades Star Camp, deportes y espectáculos para todas las edades.", keyPoints: ["Star Camp y entretenimiento", "Spa y deportes"] }
      }
    },
    "Iberostar Heritage Grand Amazon": {
      tagline: "Un hotel que navega el Amazonas",
      description: "Crucero todo incluido que parte del Puerto de Manaus y ofrece itinerarios de tres, cuatro y siete noches por los ríos Solimões y Negro.",
      tabs: {
        habitaciones: { description: "A bordo hay camarotes y suites; varias categorías cuentan con balcón privado frente al río.", keyPoints: ["Camarotes y suites", "Opciones con balcón"] },
        restaurante: { description: "VITÓRIA-RÈGIA ofrece buffet y cenas a la carta; Tucano Grill sirve desayunos y comidas en la terraza. Los horarios dependen de la ruta.", keyPoints: ["VITÓRIA-RÈGIA y Tucano Grill", "Horarios según itinerario"] },
        piscinas: { description: "El barco dispone de piscina y terrazas para descansar durante la navegación.", keyPoints: ["Piscina a bordo", "Terraza con vistas al río"] },
        experiencias: { description: "Elige entre tres itinerarios con excursiones diurnas y nocturnas, actividades a bordo y charlas sobre la Amazonia.", keyPoints: ["Tres itinerarios", "Excursiones incluidas"] }
      }
    },
    "Iberostar Waves Tucán": {
      tagline: "Todo incluido frente al mar en Playacar",
      description: "Hotel todo incluido en Playacar, Playa del Carmen, con cinco restaurantes de especialidad, tres buffets, spa, deportes acuáticos y actividades para toda la familia. Comparte complejo con Iberostar Waves Quetzal.",
      tabs: {
        habitaciones: { description: "Alojamiento para parejas y familias dentro del complejo Tucán & Quetzal.", keyPoints: ["Habitaciones y suites para familias", "Complejo compartido Tucán & Quetzal"] },
        restaurante: { description: "Cinco restaurantes de especialidad —La Góndola (italiana), Bonsai (japonesa), Mare Nostrum (mediterránea), Uxmal (mexicana) y La Hacienda Smoke House (carnes)—, más el buffet Cozumel y opciones sin gluten.", keyPoints: ["Cinco restaurantes de especialidad", "Buffet Cozumel y opciones sin gluten"] },
        piscinas: { description: "El complejo cuenta con piscinas para adultos y niños, además del acceso a la playa.", keyPoints: ["Piscinas para adultos y niños", "Acceso a la playa"] },
        experiencias: { description: "Star Camp, animación profesional, deportes acuáticos, tenis y gym, con spa y campo de golf cercano.", keyPoints: ["Star Camp y animación", "Deportes acuáticos y spa"] }
      }
    },
    "Iberostar Waves Quetzal": {
      tagline: "Frente al mar y cuatro piscinas en Playacar",
      description: "Hotel todo incluido frente al mar en Playacar, Playa del Carmen, con acceso directo a la playa, cuatro piscinas, cinco restaurantes de especialidad, spa y programas para familias. Comparte complejo con Iberostar Waves Tucán.",
      tabs: {
        habitaciones: { description: "Alojamiento para parejas y familias dentro del complejo Tucán & Quetzal.", keyPoints: ["Habitaciones y suites para familias", "Complejo compartido Tucán & Quetzal"] },
        restaurante: { description: "Cinco restaurantes de especialidad —La Góndola (italiana), Bonsai (japonesa), Mare Nostrum (mediterránea), Uxmal (mexicana) y La Hacienda Smoke House (carnes)—, más el buffet Cozumel y opciones sin gluten y a base de plantas.", keyPoints: ["Cinco restaurantes de especialidad", "Buffet Cozumel, opciones sin gluten"] },
        piscinas: { description: "Cuatro piscinas, incluida piscina infantil, además del acceso directo a la playa.", keyPoints: ["Cuatro piscinas", "Acceso directo a la playa"] },
        experiencias: { description: "Star Camp, animación, buceo PADI, tenis, gym y spa frente al mar dentro del complejo.", keyPoints: ["Star Camp y animación", "Buceo PADI y spa"] }
      }
    }
  };

  const serviceSections = {
    "Iberostar Selection Playa Mita": ["Centro de buceo PADI", "Star Camp", "Tenis y golf"],
    "Iberostar Waves Cozumel": ["Centro de buceo", "Snorkel", "Spa y actividades acuáticas"],
    "Iberostar Selection Cancún": ["Spa Sensations", "Golf y tenis", "Centro de buceo PADI", "Star Camp"],
    "Iberostar Selection Coral Cancún": ["Servicio personalizado", "Piscina privada", "Acceso a instalaciones del resort"],
    "JOIA Rose Hall by Iberostar": ["Concierge", "Spa", "Deportes acuáticos", "Traslados"],
    "Iberostar Selection Rose Hall Suites": ["Star Camp", "Spa", "Room service", "Acceso a Rose Hall Beach"],
    "Coral Level at Iberostar Selection Rose Hall Suites": ["Servicios Coral Level", "Instalaciones compartidas", "Confirmar beneficios al reservar"],
    "Iberostar Waves Rose Hall Beach": ["Parque acuático", "Spa", "Espectáculos", "Centro de buceo PADI"],
    "Iberostar Selection Bávaro Suites": ["Star Camp", "Spa", "Golf de 18 hoyos", "Centro de buceo PADI"],
    "JOIA Bávaro by Iberostar": ["Concierge", "Circuito de spa", "Golf", "Acceso gastronómico al complejo"],
    "Iberostar Waves Punta Cana": ["Star Camp", "Laboratorio de corales", "Deportes acuáticos", "Golf"],
    "Iberostar Waves Dominicana": ["Star Camp", "Laboratorio de corales", "Spa", "Deportes"],
    "Iberostar Selection Praia do Forte": ["Proyecto de conservación TAMAR", "Star Camp", "Spa", "Golf y tenis"],
    "Praia do Forte · Star Prestige": ["Servicios preferentes", "Espacios exclusivos según categoría", "Beneficios sujetos a reserva"],
    "Iberostar Waves Bahia": ["Star Camp", "Spa", "Deportes y espectáculos", "Star Prestige disponible"],
    "Iberostar Heritage Grand Amazon": ["Excursiones incluidas", "Piscina y gimnasio a bordo", "Charlas y actividades", "Atención médica a bordo"],
    "Iberostar Waves Tucán": ["Restaurantes de especialidad (x5)", "Star Camp y parque infantil", "Deportes acuáticos y buceo PADI", "Spa y masajes (con cargo)", "Wi-Fi gratuito"],
    "Iberostar Waves Quetzal": ["Frente al mar con acceso directo a la playa", "Cuatro piscinas (incl. infantil)", "Star Camp y animación", "Buceo PADI y deportes acuáticos", "Spa y masajes frente al mar", "Wi-Fi gratuito"]
  };

  Object.entries(serviceSections).forEach(([hotelName, keyPoints]) => {
    if (hotelContent[hotelName]) {
      hotelContent[hotelName].tabs.servicios = {
        description: `Consulta los servicios destacados de ${hotelName}; su disponibilidad puede depender de la categoría y las fechas de estancia.`,
        keyPoints
      };
    }
  });

  window.RevistaDigital.hotelContent = hotelContent;
})();
