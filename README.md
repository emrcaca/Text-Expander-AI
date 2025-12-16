# Text-Expander-AI + Hover Translator

Yapay zeka destekli metin genisletme ve hover ceviri ozelliklerini birlestiren bir userscript.

[English README](README.en.md)

## Ozellikler

### Text Expander
- Otomatik olarak onceden tanimli metne donusen ozel tetikleyiciler tanimlama
- Metin isleme icin yapay zeka destekli komutlar (dil bilgisi duzeltme, ozetleme, ton ayarlama vb.)
- Ctrl+Z / Ctrl+Y ile geri al/ileri al destegi
- Genisletmeden hemen sonra Backspace ile hizli geri alma

### Hover Translator
- Google Translate kullanarak secili metni otomatik cevirir
- Birden fazla hedef dili destekler (Turkce, Ingilizce, Almanca, Fransizca, Ispanyolca)
- Daha iyi performans icin cevirileri onbellege alir
- Kaynak ve hedef dil ayni oldugunda ceviriyi atlar

## Kurulum

1. Bir userscript yoneticisi yukleyin (Tampermonkey, Violentmonkey vb.)
2. Yeni bir script olusturun ve `Userscript.js` icerigini yapistirin
3. Ayarlar panelinden API ayarlarinizi yapilandirin

## Kullanim

### AI Komutlari
Metninizi yazin ve sonuna bir komut ekleyin:
```
metniniz burada -fix
```

Varsayilan komutlar:
- `-fix` - Dil bilgisi, yazim ve noktalama hatalarini duzeltir
- `-ai` - Genel yapay zeka asistani
- `-short` - Tek satirda ozetler
- `-formal` - Resmi tonda yeniden yazar
- `-casual` - Samimi tonda yeniden yazar
- `-prompt-engineer` - AI promptlari olusturur
- `-prompt-enhancer` - Mevcut promptlari gelistirir
- `-text-improver` - Metin okunabilirligini arttirir

### Tetikleyiciler
Onceden tanimli metinle otomatik degistirmek icin bir tetikleyici kelime yazin. Varsayilan tetikleyiciler yaygin selamlamalari, iletisim bilgisi yer tutucularini ve sosyal medya baglantilarini icerir.

### Ceviri
Bir web sayfasinda herhangi bir metni secin ve tooltip'te cevirisini gorun.

## Yapilandirma

Ayarlara userscript menusu uzerinden erisin (userscript yoneticisi simgesine tiklayin ve "Ayarlar"i secin).

### Ayar Sekmeleri
- Genel: Ozellikleri etkinlestir/devre disi birak, API yapilandirmasi, hedef dil
- Komutlar: Ozel promptlarla AI komutlari ekle/kaldir
- Tetikleyiciler: Metin tetikleyicileri ekle/kaldir
- Yardim: Klavye kisayollari ve kullanim kilavuzu

### API Yapilandirmasi
- URL: OpenAI uyumlu API endpoint'iniz
- Key: API anahtariniz
- Model: Kullanilacak model adi

## Klavye Kisayollari

| Islem | Kisayol |
|-------|---------|
| Geri Al | Ctrl+Z |
| Ileri Al | Ctrl+Y |
| Hizli Geri Al | Backspace (genisletmeden hemen sonra) |
| Iptal | ESC |

## Gereksinimler

- Userscript yoneticisi (Tampermonkey, Violentmonkey, Greasemonkey)
- AI komutlari icin OpenAI uyumlu API endpoint'i

## Lisans

MIT
