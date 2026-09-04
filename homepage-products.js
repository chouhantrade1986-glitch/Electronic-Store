/**
 * ElectroMart Dynamic Homepage Product Models & Multilingual Renderer
 * Supports 11 Indian Languages with Amazon-style card rendering.
 */

(function () {
  const HOMEPAGE_TOP_PICKS = [
    {
      id: "p1",
      link: "laptop.html",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=250&q=80",
      rating: "⭐⭐⭐⭐⭐",
      reviews: "4,129",
      price: 64990,
      mrp: 75000,
      title: {
        en: "ProBook 15\" Laptop (Intel Core i5, 16GB RAM, 512GB SSD)",
        hi: "प्रोबुक 15\" लैपटॉप (इंटेल कोर i5, 16GB रैम, 512GB एसएसडी)",
        ta: "புரோபுக் 15\" லேப்டாப் (இன்டெல் கோர் i5, 16GB ரேம், 512GB SSD)",
        te: "ప్రోబుక్ 15\" ల్యాప్‌టాప్ (ఇంటెల్ కోర్ i5, 16GB ర్యామ్, 512GB SSD)",
        kn: "ಪ್ರೋಬುಕ್ 15\" ಲ್ಯಾಪ್‌ಟಾಪ್ (ಇಂಟೆಲ್ ಕೋರ್ i5, 16GB RAM, 512GB SSD)",
        ml: "പ്രോബുക്ക് 15\" ലാപ്‌ടോപ്പ് (ഇന്റൽ കോർ i5, 16GB റാം, 512GB SSD)",
        bn: "প্রোবুক 15\" ল্যাপটপ (ইন্টেল কোর i5, 16GB র‍্যাম, 512GB SSD)",
        mr: "प्रोबुक 15\" लॅपटॉप (इंटेल कोर i5, 16GB रॅम, 512GB SSD)",
        ur: "پرو بک 15\" لیپ ٹاپ (انٹیل کور i5, 16GB ریم, 512GB ایس ایس ڈی)",
        pa: "ਪ੍ਰੋਬੁੱਕ 15\" ਲੈਪਟਾਪ (ਇੰਟੇਲ ਕੋਰ i5, 16GB ਰੈਮ, 512GB SSD)",
        gu: "પ્રોબુક 15\" લેપટોપ (ઇન્ટેલ કોર i5, 16GB રેમ, 512GB SSD)"
      }
    },
    {
      id: "p2",
      link: "products.html?search=audio",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=250&q=80",
      rating: "⭐⭐⭐⭐½",
      reviews: "1,850",
      price: 4499,
      mrp: 7999,
      title: {
        en: "Aura ANC Wireless Noise Cancelling Headphones",
        hi: "ऑरा एएनसी वायरलेस नॉइज़ कैंसिलिंग हेडफ़ोन",
        ta: "ஆரா ANC வயர்லெஸ் நாய்ஸ் கேன்சலிங் ஹெட்ஃபோன்கள்",
        te: "ఆరా ANC వైర్‌లెస్ నాయిస్ క్యాన్సిలింగ్ హెడ్‌ఫోన్స్",
        kn: "ಆರಾ ANC ವೈರ್‌ಲೆಸ್ ನಾಯ್ಸ್ ಕ್ಯಾನ್ಸಲಿಂಗ್ ಹೆಡ್‌ಫೋನ್ಸ್",
        ml: "ഓറ ANC വയർലെസ്സ് നോയ്സ് കാൻസലിങ് ഹെഡ്ഫോണുകൾ",
        bn: "অরা এএনসি ওয়্যারলেস নয়েজ ক্যানসেলিং হেডফোন",
        mr: "ऑरा एएनसी वायरलेस नॉईज कॅन्सलिंग हेडफोन्स",
        ur: "آورا ANC وائرلیس شور منسوخ کرنے والے ہیڈ فون",
        pa: "ਔਰਾ ANC ਵਾਇਰਲੈੱਸ ਸ਼ੋਰ ਰੱਦ ਕਰਨ ਵਾਲੇ ਹੈੱਡਫੋਨ",
        gu: "ઓરા ANC વાયરલેસ નોઈઝ કેન્સલિંગ હેડફોન"
      }
    },
    {
      id: "p3",
      link: "products.html?search=watch",
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=250&q=80",
      rating: "⭐⭐⭐⭐",
      reviews: "5,622",
      price: 2999,
      mrp: 5999,
      title: {
        en: "FitTrack Pro Smartwatch 4 (Fitness & SpO2)",
        hi: "फ़िटट्रैक प्रो स्मार्टवॉच 4 (फिटनेस और SpO2)",
        ta: "ஃபிட்திராக் ப்ரோ ஸ்மார்ட்வாட்ச் 4",
        te: "ఫిట్‌ట్రాక్ ప్రో స్మార్ట్‌వాచ్ 4",
        kn: "ಫಿಟ್‌ಟ್ರ್ಯಾಕ್ ಪ್ರೊ ಸ್ಮಾರ್ಟ್‌ವಾಚ್ 4",
        ml: "ഫിറ്റ്‌ട്രാക്ക് പ്രോ സ്മാർട്ട് വാച്ച് 4",
        bn: "ফিটট্র্যাক প্রো স্মার্টওয়াচ 4",
        mr: "फिटट्रॅक प्रो स्मार्टवॉच 4",
        ur: "فٹ ٹریک پرو اسمارٹ واچ 4",
        pa: "ਫਿਟਟ੍ਰੈਕ ਪ੍ਰੋ ਸਮਾਰਟਵਾਚ 4",
        gu: "ફિટટ્રેક પ્રો સ્માર્ટવોચ 4"
      }
    },
    {
      id: "p4",
      link: "products.html?search=mobile",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=250&q=80",
      rating: "⭐⭐⭐⭐⭐",
      reviews: "12,045",
      price: 34990,
      mrp: 45000,
      title: {
        en: "Nexus Phone 12 (5G, 128GB Storage)",
        hi: "नेक्सस फोन 12 (5G, 128GB स्टोरेज)",
        ta: "நெக்ஸஸ் போன் 12 (5G, 128GB ஸ்டோரேஜ்)",
        te: "నెక్సస్ ఫోన్ 12 (5G, 128GB స్టోరేజ్)",
        kn: "ನೆಕ್ಸಸ್ ಫೋನ್ 12 (5G, 128GB ಸಂಗ್ರಹಣೆ)",
        ml: "നെക്സസ് ഫോൺ 12 (5G, 128GB സ്റ്റോറേജ്)",
        bn: "নেক্সাস ফোন 12 (5G, 128GB স্টোরেজ)",
        mr: "नेक्सस फोन 12 (5G, 128GB स्टोरेज)",
        ur: "نیکسس فون 12 (5G, 128GB اسٹوریج)",
        pa: "ਨੈਕਸਸ ਫ਼ੋਨ 12 (5G, 128GB ਸਟੋਰੇਜ)",
        gu: "નેક્સસ ફોન 12 (5G, 128GB સ્ટોરેજ)"
      }
    }
  ];

  const HOMEPAGE_RECOMMENDED = [
    {
      id: "lap-pavilion",
      link: "laptop.html",
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&q=80",
      rating: "★★★★☆",
      reviews: "1,842",
      dealBadgeKey: "limited_time_deal",
      price: 56990,
      mrp: 68999,
      title: {
        en: "HP Pavilion 15 Gaming Laptop, AMD Ryzen 5, 16GB RAM, 512GB SSD",
        hi: "एचपी पवेलियन 15 गेमिंग लैपटॉप, एएमडी राइजन 5, 16GB रैम, 512GB एसएसडी",
        ta: "HP பெவிலியன் 15 கேமிங் லேப்டாப், AMD ரைசன் 5, 16GB ரேம், 512GB SSD",
        te: "HP పెవిలియన్ 15 గేమింగ్ ల్యాప్‌టాప్, AMD రైజెన్ 5, 16GB ర్యామ్, 512GB SSD",
        kn: "HP ಪೆವಿಲಿಯನ್ 15 ಗೇಮಿಂಗ್ ಲ್ಯಾಪ್‌ಟಾಪ್, AMD ರೈಜನ್ 5, 16GB RAM, 512GB SSD",
        ml: "HP പവലിയൻ 15 ഗെയിമിംഗ് ലാപ്‌ടോപ്പ്, AMD റൈസൻ 5, 16GB റാം, 512GB SSD",
        bn: "HP প্যাভিলিয়ন 15 গেমিং ল্যাপটপ, AMD রাইজেন 5, 16GB র‍্যাম, 512GB SSD",
        mr: "HP पॅव्हिलियन 15 गेमिंग लॅपटॉप, AMD रायझेन 5, 16GB रॅम, 512GB SSD",
        ur: "HP پویلین 15 گیمنگ لیپ ٹاپ, AMD رائزن 5, 16GB ریم, 512GB ایس ایس ڈی",
        pa: "HP ਪਵੇਲੀਅਨ 15 ਗੇਮਿੰਗ ਲੈਪਟਾਪ, AMD ਰਾਈਜ਼ਨ 5, 16GB ਰੈਮ, 512GB SSD",
        gu: "HP પેવેલિયન 15 ગેમિંગ લેપટોપ, AMD રાઇઝન 5, 16GB રેમ, 512GB SSD"
      }
    },
    {
      id: "audio-sony-xm4",
      link: "products.html?search=audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
      rating: "★★★★★",
      reviews: "4,210",
      dealBadgeKey: "26% off",
      price: 22990,
      mrp: 29990,
      title: {
        en: "Sony WH-1000XM4 Wireless Noise Cancelling Over-Ear Headphones",
        hi: "सोनी WH-1000XM4 वायरलेस नॉइज़ कैंसिलिंग ओवर-ईयर हेडफ़ोन",
        ta: "சோனி WH-1000XM4 வயர்லெஸ் நாய்ஸ் கேன்சலிங் ஹெட்ஃபோன்கள்",
        te: "సోనీ WH-1000XM4 వైర్‌లెస్ నాయిస్ క్యాన్సిలింగ్ హెడ్‌ఫోన్స్",
        kn: "ಸೋನಿ WH-1000XM4 ವೈರ್‌ಲೆಸ್ ನಾಯ್ಸ್ ಕ್ಯಾನ್ಸಲಿಂಗ್ ಹೆಡ್‌ಫೋನ್ಸ್",
        ml: "സോണി WH-1000XM4 വയർലെസ്സ് നോയ്സ് കാൻസലിങ് ഹെഡ്ഫോണുകൾ",
        bn: "সোনি WH-1000XM4 ওয়্যারলেস নয়েজ ক্যানসেলিং হেডফোন",
        mr: "सोनी WH-1000XM4 वायरलेस नॉईज कॅन्सलिंग हेडफोन्स",
        ur: "سونی WH-1000XM4 وائرلیس شور منسوخ کرنے والے ہیڈ فون",
        pa: "ਸੋਨੀ WH-1000XM4 ਵਾਇਰਲੈੱਸ ਸ਼ੋਰ ਰੱਦ ਕਰਨ ਵਾਲੇ ਹੈੱਡਫੋਨ",
        gu: "સોની WH-1000XM4 વાયરલેસ નોઈઝ કેન્સલિંગ હેડફોન"
      }
    },
    {
      id: "mob-op12",
      link: "products.html?search=mobile",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80",
      rating: "★★★★☆",
      reviews: "2,630",
      dealBadgeKey: "todays_hot_deals",
      price: 64999,
      mrp: 69999,
      title: {
        en: "OnePlus 12 5G (Flowy Emerald, 12GB RAM, 256GB Storage)",
        hi: "वनप्लस 12 5G (फ्लोई एमराल्ड, 12GB रैम, 256GB स्टोरेज)",
        ta: "ஒன்பிளஸ் 12 5G (12GB ரேம், 256GB ஸ்டோரேஜ்)",
        te: "వన్ ప్లస్ 12 5G (12GB ర్యామ్, 256GB స్టోరేజ్)",
        kn: "ಒನ್‌ಪ್ಲಸ್ 12 5G (12GB RAM, 256GB ಸಂಗ್ರಹಣೆ)",
        ml: "വൺപ്ലസ് 12 5G (12GB റാം, 256GB സ്റ്റോറേജ്)",
        bn: "ওয়ানপ্লাস 12 5G (12GB র‍্যাম, 256GB স্টোরেজ)",
        mr: "वनप्लस 12 5G (12GB रॅम, 256GB स्टोरेज)",
        ur: "ون پلس 12 5G (12GB ریم, 256GB اسٹوریج)",
        pa: "ਵਨਪਲੱਸ 12 5G (12GB ਰੈਮ, 256GB ਸਟੋਰੇਜ)",
        gu: "વનપ્લસ 12 5G (12GB રેમ, 256GB સ્ટોરેજ)"
      }
    },
    {
      id: "cpu-7800x3d",
      link: "products.html?category=computer",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&q=80",
      rating: "★★★★★",
      reviews: "945",
      dealBadgeKey: "limited_time_deal",
      price: 36499,
      mrp: 44500,
      title: {
        en: "AMD Ryzen 7 7800X3D 8-Core 16-Thread Desktop Processor",
        hi: "एएमडी राइजन 7 7800X3D 8-कोर 16-थ्रेड डेस्कटॉप प्रोसेसर",
        ta: "AMD ரைசன் 7 7800X3D 8-கோர் டெஸ்க்டாப் ப்ராசசர்",
        te: "AMD రైజెన్ 7 7800X3D 8-కోర్ డెస్క్‌టాప్ ప్రాసెసర్",
        kn: "AMD ರೈಜನ್ 7 7800X3D 8-ಕೋರ್ ಡೆಸ್ಕ್‌ಟಾಪ್ ಪ್ರೊಸೆಸರ್",
        ml: "AMD റൈസൻ 7 7800X3D 8-കോർ ഡെസ്ക്ടോപ്പ് പ്രൊസസ്സർ",
        bn: "AMD রাইজেন 7 7800X3D 8-কোর ডেস্কটপ প্রসেসর",
        mr: "AMD रायझेन 7 7800X3D 8-कोर डेस्कटॉप प्रोसेसर",
        ur: "AMD رائزن 7 7800X3D 8-کور ڈیسک ٹاپ پروسیسر",
        pa: "AMD ਰਾਈਜ਼ਨ 7 7800X3D 8-ਕੋਰ ਡੈਸਕਟਾਪ ਪ੍ਰੋਸੈਸਰ",
        gu: "AMD રાઇઝન 7 7800X3D 8-કોર ડેસ્કટોપ પ્રોસેસર"
      }
    },
    {
      id: "prn-canon-g3010",
      link: "printer.html",
      image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&q=80",
      rating: "★★★★☆",
      reviews: "3,115",
      dealBadgeKey: "limited_time_deal",
      price: 13499,
      mrp: 15999,
      title: {
        en: "Canon PIXMA G3010 All-in-One Wireless Ink Tank Colour Printer",
        hi: "कैनन पिक्समा G3010 ऑल-इन-वन वायरलेस इंक टैंक कलर प्रिंटर",
        ta: "கேனான் PIXMA G3010 வயர்லெஸ் கலர் பிரிண்டர்",
        te: "కెనాన్ PIXMA G3010 వైర్‌లెస్ కలర్ ప్రింటర్",
        kn: "ಕ್ಯಾನನ್ PIXMA G3010 ವೈರ್‌ಲೆಸ್ ಕಲರ್ ಪ್ರಿಂಟರ್",
        ml: "കാനൻ PIXMA G3010 വയർലെസ്സ് കളർ പ്രിന്റർ",
        bn: "ক্যানন PIXMA G3010 ওয়্যারলেস কালার প্রিন্টার",
        mr: "कॅनॉन PIXMA G3010 वायरलेस कलर प्रिंटर",
        ur: "کینن PIXMA G3010 وائرلیس رنگین پرنٹر",
        pa: "ਕੈਨਨ PIXMA G3010 ਵਾਇਰਲੈੱਸ ਰੰਗੀਨ ਪ੍ਰਿੰਟਰ",
        gu: "કેનન PIXMA G3010 વાયરલેસ કલર પ્રિન્ટર"
      }
    }
  ];

  const HOMEPAGE_DEALS = [
    {
      id: "d1",
      nameKey: "Vector Gaming Laptop",
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80",
      rating: 4.8,
      price: 64990,
      oldPrice: 85000,
      discount: 24,
      badgeKey: "deal_of_the_day",
      claimed: 85,
      title: {
        en: "Vector Gaming Laptop",
        hi: "वेक्टर गेमिंग लैपटॉप",
        ta: "வெக்டர் கேமிங் லேப்டாப்",
        te: "వెక్టర్ గేమింగ్ ల్యాప్‌టాప్",
        kn: "ವೆಕ್ಟರ್ ಗೇಮಿಂಗ್ ಲ್ಯಾಪ್‌ಟಾಪ್",
        ml: "വെക്റ്റർ ഗെയിമിംഗ് ലാപ്‌ടോപ്പ്",
        bn: "ভেক্টর গেমিং ল্যাপটপ",
        mr: "व्हेक्टर गेमिंग लॅपटॉप",
        ur: "ویکٹر گیمنگ لیپ ٹاپ",
        pa: "ਵੈਕਟਰ ਗੇਮਿੰਗ ਲੈਪਟਾਪ",
        gu: "વેક્ટર ગેમિંગ લેપટોપ"
      }
    },
    {
      id: "d2",
      nameKey: "AstraBook Pro 14\"",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
      rating: 4.6,
      price: 49990,
      oldPrice: 65000,
      discount: 23,
      badgeKey: "todays_hot_deals",
      claimed: 60,
      title: {
        en: "AstraBook Pro 14\"",
        hi: "एस्ट्राबुक प्रो 14\"",
        ta: "அஸ்ட்ராபுக் ப்ரோ 14\"",
        te: "ఆస్ట్రాబుక్ ప్రో 14\"",
        kn: "ಅಸ್ಟ್ರಾಬುಕ್ ಪ್ರೊ 14\"",
        ml: "അസ്ട്രാബുക്ക് പ്രോ 14\"",
        bn: "অ্যাস্ট্রাবুক প্রো 14\"",
        mr: "अ‍ॅस्ट्राबुक प्रो 14\"",
        ur: "ایسٹرا بک پرو 14\"",
        pa: "ਐਸਟ੍ਰਾਬੁੱਕ ਪ੍ਰੋ 14\"",
        gu: "એસ્ટ્રાબુક પ્રો 14\""
      }
    },
    {
      id: "d3",
      nameKey: "Nimbus Phone X",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
      rating: 4.5,
      price: 29990,
      oldPrice: 39990,
      discount: 25,
      badgeKey: "deal_of_the_day",
      claimed: 90,
      title: {
        en: "Nimbus Phone X",
        hi: "निंबस फोन एक्स",
        ta: "நிம்பஸ் போன் X",
        te: "నింబస్ ఫోన్ X",
        kn: "ನಿಂಬಸ್ ಫೋನ್ X",
        ml: "നിംബസ് ഫോൺ X",
        bn: "নিম্বাস ফোন X",
        mr: "निंबस फोन X",
        ur: "نیمبس فون X",
        pa: "ਨਿੰਬਸ ਫ਼ੋਨ X",
        gu: "નિમ્બસ ફોન X"
      }
    },
    {
      id: "d4",
      nameKey: "Pulse ANC Headphones",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      rating: 4.4,
      price: 3499,
      oldPrice: 7999,
      discount: 56,
      badgeKey: "limited_time_deal",
      claimed: 45,
      title: {
        en: "Pulse ANC Headphones",
        hi: "पल्स एएनसी हेडफ़ोन",
        ta: "பல்ஸ் ANC ஹெட்ஃபோன்கள்",
        te: "పల్స్ ANC హెడ్‌ఫోన్స్",
        kn: "ಪಲ್ಸ್ ANC ಹೆಡ್‌ಫೋನ್ಸ್",
        ml: "പൾസ് ANC ഹെഡ്ഫോണുകൾ",
        bn: "পালস এএনসি হেডফোন",
        mr: "पल्स एएनसी हेडफोन्स",
        ur: "پلس ANC ہیڈ فون",
        pa: "ਪਲਸ ANC ਹੈੱਡਫੋਨ",
        gu: "પલ્સ ANC હેડફોન"
      }
    }
  ];

  function moneyINR(n) {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
    } catch {
      return "₹" + n.toLocaleString("en-IN");
    }
  }

  function addToCart(prodOrId, btnEl) {
    try {
      let id, name, price, image;
      if (typeof prodOrId === "object" && prodOrId !== null) {
        id = String(prodOrId.id || "p1");
        name = prodOrId.name || "Product";
        price = Number(prodOrId.price || 0);
        image = prodOrId.image || "";
      } else {
        id = String(prodOrId || "p1");
        name = "Product #" + id;
        price = 0;
        image = "";
      }

      if (typeof localStorage !== "undefined") {
        const cartKey = "electromart_cart_v1";
        let cartMap = {};
        try {
          const raw = localStorage.getItem(cartKey);
          cartMap = raw ? JSON.parse(raw) : {};
          if (!cartMap || typeof cartMap !== "object") cartMap = {};
        } catch (e) {
          cartMap = {};
        }
        cartMap[id] = (Number(cartMap[id]) || 0) + 1;
        localStorage.setItem(cartKey, JSON.stringify(cartMap));

        const catalogKey = "electromart_catalog_v1";
        let catMap = {};
        try {
          const rawCat = localStorage.getItem(catalogKey);
          catMap = rawCat ? JSON.parse(rawCat) : {};
          if (!catMap || typeof catMap !== "object") catMap = {};
        } catch (e) {
          catMap = {};
        }
        if (!catMap[id]) {
          catMap[id] = { id: id, name: name, price: price, image: image };
          localStorage.setItem(catalogKey, JSON.stringify(catMap));
        }

        if (typeof window !== "undefined" && typeof window.syncCartCount === "function") {
          window.syncCartCount();
        } else if (typeof document !== "undefined" && document.querySelectorAll) {
          const totalCount = Object.values(cartMap).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
          const badges = document.querySelectorAll(".cart-count, #cartCount");
          badges.forEach((b) => { b.textContent = String(totalCount); });
        }
      }

      // Visual feedback
      const btn = btnEl || (typeof event !== "undefined" && event ? (event.currentTarget || event.target) : null);
      if (btn && btn.classList && btn.classList.add) {
        const origText = btn.innerHTML;
        btn.classList.add("btn-added");
        btn.innerHTML = "✓ Added";
        setTimeout(() => {
          btn.classList.remove("btn-added");
          btn.innerHTML = origText;
        }, 1500);
      }

      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof CustomEvent === "function") {
        window.dispatchEvent(new CustomEvent("electromart:cart-updated"));
      }
    } catch (err) {
      console.warn("addToCart error:", err);
    }
  }

  function setupCarouselPaddles() {
    if (typeof document === "undefined" || !document.querySelectorAll) return;
    try {
      const wrappers = document.querySelectorAll(".amz-carousel-wrapper");
      if (!wrappers || !wrappers.length) return;
      wrappers.forEach((wrapper) => {
        if (wrapper.dataset && wrapper.dataset.paddlesAttached === "true") return;
        if (wrapper.dataset) wrapper.dataset.paddlesAttached = "true";
        const row = wrapper.querySelector(".amz-deal-strip-row, .amz-shelf-row, #homeTopPicksGrid, #homeDealsGrid, #homeRecommendedShelfRow, #homeBrowsingHistoryRow");
        const prevBtn = wrapper.querySelector(".amz-carousel-paddle.prev");
        const nextBtn = wrapper.querySelector(".amz-carousel-paddle.next");
        if (row && prevBtn) {
          prevBtn.addEventListener("click", () => {
            row.scrollBy({ left: -420, behavior: "smooth" });
          });
        }
        if (row && nextBtn) {
          nextBtn.addEventListener("click", () => {
            row.scrollBy({ left: 420, behavior: "smooth" });
          });
        }
      });
    } catch (e) {
      // safe fallback in test environments
    }
  }

  function renderHomepageProducts(lang) {
    const activeLang = (lang || localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[activeLang]) ? window.EM_TRANSLATIONS[activeLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});

    const addToCartText = dict.add_to_cart || "Add to Cart";
    const dealOfTheDayText = dict.deal_of_the_day || "Deal of the Day";
    const limitedTimeDealText = dict.limited_time_deal || "Limited time deal";

    // 1. Top Picks Grid
    const topPicksContainer = document.getElementById("homeTopPicksGrid");
    if (topPicksContainer) {
      topPicksContainer.innerHTML = HOMEPAGE_TOP_PICKS.map((prod) => {
        const titleText = (prod.title && (prod.title[activeLang] || prod.title.en)) || "Product";
        return `
          <div class="deal-card product-card" style="flex: 0 0 230px; max-width: 250px; background: #fff; border: 1px solid #e3e6e6; border-radius: 4px; padding: 1rem; display: flex; flex-direction: column; text-align: left;">
            <a href="${prod.link}" style="text-decoration: none; color: inherit;">
              <img src="${prod.image}" alt="${titleText}" style="width: 100%; height: 160px; object-fit: contain; margin-bottom: 0.5rem;" loading="lazy">
              <h3 style="font-size: 1rem; font-weight: 500; margin: 0 0 0.2rem 0; color: #0f1111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${titleText}">${titleText}</h3>
              <div style="color: #e77600; font-size: 0.9rem; margin-bottom: 0.2rem;">${prod.rating} <span style="color: #007185; font-size: 0.8rem;">(${prod.reviews})</span></div>
              <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="font-size: 1.25rem; font-weight: 700; color: #0f1111;">${moneyINR(prod.price)}</span>
                <span style="font-size: 0.85rem; color: #565959; text-decoration: line-through;">${moneyINR(prod.mrp)}</span>
              </div>
            </a>
            <button class="amz-hp-atc-btn add-to-cart-btn" style="margin-top: auto; background: #ffd814; border: 1px solid #fcd200; border-radius: 20px; padding: 0.5rem; width: 100%; cursor: pointer; font-weight: 500;" onclick="addToCart({id: '${prod.id}', name: '${titleText.replace(/'/g, "\\'")}', price: ${prod.price}, image: '${prod.image}'}, this)">${addToCartText}</button>
          </div>
        `;
      }).join("");
    }

    // 2. Deals Grid
    const dealsContainer = document.getElementById("homeDealsGrid");
    if (dealsContainer) {
      dealsContainer.innerHTML = HOMEPAGE_DEALS.map((d, i) => {
        const titleText = (d.title && (d.title[activeLang] || d.title.en)) || d.nameKey;
        const badgeLabel = d.badgeKey === "deal_of_the_day" ? dealOfTheDayText : (d.badgeKey === "limited_time_deal" ? limitedTimeDealText : (dict[d.badgeKey] || d.badgeKey));
        return `
          <div style="flex: 0 0 250px; background: #fff; border: 1px solid #e3e6e6; border-radius: 4px; padding: 1rem; position: relative; display: flex; flex-direction: column;">
            ${d.badgeKey ? `<div style="position: absolute; top: 10px; left: 10px; background: #cc0c39; color: white; padding: 4px 8px; font-size: 0.75rem; font-weight: bold; border-radius: 2px; z-index: 1;">${badgeLabel}</div>` : ""}
            <a href="products.html?search=${encodeURIComponent(d.nameKey)}" style="text-decoration: none; color: inherit; flex-grow: 1; display: flex; flex-direction: column;">
              <img src="${d.image}" alt="${titleText}" style="width: 100%; height: 150px; object-fit: contain; margin-bottom: 1rem;" loading="lazy" />
              
              <div style="margin: 0.5rem 0; width: 100%; background: #e3e6e6; border-radius: 4px; height: 8px; overflow: hidden;">
                <div style="width: ${d.claimed}%; background: #cc0c39; height: 100%;"></div>
              </div>
              <div style="font-size: 0.75rem; color: #565959; margin-bottom: 0.5rem;">${d.claimed}% Claimed</div>

              <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span style="background: #cc0c39; color: white; padding: 2px 6px; border-radius: 2px; font-size: 0.8rem; font-weight: bold;">${d.discount}% off</span>
                <span style="color: #cc0c39; font-size: 0.8rem; font-weight: 700;">${limitedTimeDealText}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span style="font-size: 1.25rem; font-weight: 700; color: #0f1111;">${moneyINR(d.price)}</span>
                <span style="font-size: 0.85rem; color: #565959; text-decoration: line-through;">M.R.P.: ${moneyINR(d.oldPrice)}</span>
              </div>
              <h3 style="font-size: 1rem; font-weight: 500; margin: 0 0 0.5rem 0; color: #0f1111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${titleText}">${titleText}</h3>
              <div id="claimProgress-${i}" data-claim-progress="${d.claimed}"></div>
            </a>
            <button class="amz-hp-atc-btn add-to-cart-btn" style="background: #ffd814; border: 1px solid #fcd200; border-radius: 20px; padding: 0.5rem; width: 100%; cursor: pointer; font-weight: 500; margin-top: auto;" onclick="addToCart({id: '${d.id}', name: '${titleText.replace(/'/g, "\\'")}', price: ${d.price}, image: '${d.image}'}, this)">${addToCartText}</button>
          </div>
        `;
      }).join("");
    }

    // 3. Recommended Shelf Row
    const shelfContainer = document.getElementById("homeRecommendedShelfRow");
    if (shelfContainer) {
      shelfContainer.innerHTML = HOMEPAGE_RECOMMENDED.map((prod) => {
        const titleText = (prod.title && (prod.title[activeLang] || prod.title.en)) || "Product";
        const badgeLabel = prod.dealBadgeKey === "limited_time_deal" ? limitedTimeDealText : (dict[prod.dealBadgeKey] || prod.dealBadgeKey);
        return `
          <div class="amz-shelf-card">
            <a href="${prod.link}" class="amz-shelf-img-wrap">
              <img src="${prod.image}" alt="${titleText}" loading="lazy">
            </a>
            <a href="${prod.link}" class="amz-shelf-product-title" title="${titleText}">${titleText}</a>
            <div class="amz-shelf-rating">
              <span class="amz-shelf-stars">${prod.rating}</span>
              <span>(${prod.reviews})</span>
            </div>
            <div class="amz-shelf-price-row">
              <span class="amz-shelf-deal-badge">${badgeLabel}</span>
              <div class="amz-shelf-price"><sup>₹</sup>${prod.price.toLocaleString("en-IN")}</div>
              <div class="amz-shelf-mrp">M.R.P.: ${moneyINR(prod.mrp)}</div>
            </div>
            <button class="amz-hp-atc-btn amz-shelf-add-btn add-btn" type="button" onclick="addToCart({id: '${prod.id}', name: '${titleText.replace(/'/g, "\\'")}', price: ${prod.price}, image: '${prod.image}'}, this)">${addToCartText}</button>
          </div>
        `;
      }).join("");
    }

    // 4. Browsing History Row
    const historyContainer = document.getElementById("homeBrowsingHistoryRow");
    if (historyContainer) {
      historyContainer.innerHTML = HOMEPAGE_TOP_PICKS.slice(0, 3).map((prod) => {
        const titleText = (prod.title && (prod.title[activeLang] || prod.title.en)) || "Product";
        return `
          <a href="${prod.link}" style="flex: 0 0 160px; text-decoration: none; color: inherit; display: flex; flex-direction: column; text-align: left;">
            <img src="${prod.image}" style="width: 100%; height: 120px; object-fit: contain; margin-bottom: 0.5rem;" alt="${titleText}">
            <span style="color: #007185; font-size: 0.85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.2rem;" title="${titleText}">${titleText}</span>
            <span style="color: #b12704; font-size: 0.9rem; font-weight: 700;">${moneyINR(prod.price)}</span>
          </a>
        `;
      }).join("");
    }

    setupCarouselPaddles();
  }

  // Export globally
  window.HOMEPAGE_TOP_PICKS = HOMEPAGE_TOP_PICKS;
  window.HOMEPAGE_RECOMMENDED = HOMEPAGE_RECOMMENDED;
  window.HOMEPAGE_DEALS = HOMEPAGE_DEALS;
  window.renderHomepageProducts = renderHomepageProducts;
  window.renderProducts = renderHomepageProducts;
  window.addToCart = addToCart;
  window.setupCarouselPaddles = setupCarouselPaddles;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const activeLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
      renderHomepageProducts(activeLang);
    });
  } else {
    const activeLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    renderHomepageProducts(activeLang);
  }
})();
