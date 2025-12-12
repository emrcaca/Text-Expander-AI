# Text-Expander-AI

<div align="center">

```
                          ███████╗███╗   ███╗██████╗  ██████╗ █████╗  ██████╗ █████╗ 
                          ██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗
                          █████╗  ██╔████╔██║██████╔╝██║     ███████║██║     ███████║
                          ██╔══╝  ██║╚██╔╝██║██╔══██╗██║     ██╔══██║██║     ██╔══██║
                          ███████╗██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██║╚██████╗██║  ██║
                          ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
```

**AI destekli metin genişletici ve hover çeviri aracı**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/emrcaca/AI-Text-Improver)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![UserScript](https://img.shields.io/badge/userscript-Tampermonkey-orange.svg)](https://www.tampermonkey.net/)

[Ozellikler](#ozellikler) | [Kurulum](#kurulum) | [Kullanim](#kullanim) | [Komutlar](#komutlar) | [Yapilandirma](#yapilandirma)

</div>

---

## Ozellikler

### AI Destekli Metin Isleme
- **Yazim Duzeltme** - Gramer ve imla hatalarini otomatik duzeltir
- **Metin Gelistirme** - Metninizi daha acik ve etkili hale getirir
- **Metin Genisletme** - Kisa metinleri detayli iceriklere donusturur
- **Ceviri** - Ingilizce ve Turkce arasinda anlik ceviri
- **Ozetleme** - Uzun metinleri kisa ozetlere donusturur
- **Ton Degistirme** - Resmi veya gunluk dil secenekleri

### Hover Ceviri
- Herhangi bir metni secin, otomatik olarak Turkce'ye cevrilsin
- Sik tooltip arayuzu
- Ceviri onbellekleme ile hizli sonuclar

### Metin Kisayollari
- Ozellestirilebilir tetikleyiciler
- Dinamik degerler (tarih, saat, gun)
- Ozel karakter destegi

### Discord Entegrasyonu
- Webhook uzerinden dogrudan not gonderimi
- Hizli paylasim imkani

---

## Kurulum

### Gereksinimler
- [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari)
- veya [Violentmonkey](https://violentmonkey.github.io/)
- veya [Greasemonkey](https://www.greasespot.net/) (Firefox)

### Adimlar

1. Tarayiciniza Tampermonkey eklentisini yukleyin
2. Scripti manuel olarak ekleyin
3. Script otomatik olarak tum sayfalarda calisacaktir

---

## Kullanim

### AI Komutlari

Herhangi bir metin giris alanina yazin ve komutla bitirin:

```
Merhaba dunya bu bir test metnidir -fix
```

Metin otomatik olarak islenecek ve sonuc yerine yazilacaktir.

### Hover Ceviri

1. Herhangi bir web sayfasinda metin secin
2. Ceviri otomatik olarak tooltip'te gorunecektir

### Metin Kisayollari

```
"1  ->  Owo h
"2  ->  Owo b
:tarih  ->  25.01.2025
:saat   ->  14:30
```

### Yardim Menusu

`Alt + H` tuslarina basarak yardim menusunu acabilirsiniz.

---

### Ayarlar Menusu

`Alt + S` tuslarina basarak ayarlar menusunu acabilirsiniz.

## Komutlar

### AI Komutlari

| Komut | Aciklama | Ornek |
|-------|----------|-------|
| `-fix` | Yazim ve gramer hatalarini duzeltir | `Merhba dunya -fix` |
| `-imp` | Metni gelistirir ve iyilestirir | `Bu iyi bir fikir -imp` |
| `-gen` | Metni genisletir ve detaylandirir | `AI nedir -gen` |
| `-en` | Turkce'den Ingilizce'ye ceviri | `Merhaba dunya -en` |
| `-tr` | Ingilizce'den Turkce'ye ceviri | `Hello world -tr` |
| `-sum` | Metni ozetler | `[uzun metin] -sum` |
| `-frm` | Resmi dile donusturur | `selam napiyon -frm` |
| `-cas` | Gunluk dile donusturur | `Sayin yetkili -cas` |
| `-ai` | Serbest AI sorgusu | `Python nedir -ai` |
| `-wh` | Discord'a gonderir | `Not: Toplanti 15:00 -wh` |

### Metin Kisayollari

| Tetikleyici | Sonuc |
|-------------|-------|
| `"1` | Owo h |
| `"2` | Owo b |
| `"3` | Owo |
| `"4` | Owo pray |
| `:check` | (onay isareti) |
| `:cross` | (carpi isareti) |
| `:heart` | (kalp) |
| `:tarih` | Gunun tarihi (TR) |
| `:date` | Gunun tarihi (EN) |
| `:saat` | Su anki saat (TR) |
| `:time` | Su anki saat (EN) |
| `:gun` | Gunun adi |

### Klavye Kisayollari

| Kisayol | Eylem |
|---------|-------|
| `Alt + H` | Yardim menusunu ac/kapat |
| `Alt + S` | Ayarlar menusunu ac/kapat |
| `ESC` | AI islemini iptal et / Menuyu kapat |

---

## Yapilandirma

Script icindeki `CONFIG` objesi uzerinden ayarlari ozellestirebilirsiniz:

```javascript
const CONFIG = {
    // AI API Ayarlari
    ai: {
        url: "https://api.example.com/v1/chat/completions",
        key: "your-api-key",
        model: "openai/gpt-4",
        temperature: 0.7,
        maxTokens: 2000
    },

    // Discord Webhook
    discord: {
        webhookUrl: "https://discord.com/api/webhooks/...",
        username: "Notes"
    },

    // Cevirmen Ayarlari
    translator: {
        targetLang: 'tr',  // Hedef dil
        debounce: 300      // Gecikme (ms)
    },

    // Animasyon Ayarlari
    dots: {
        enabled: true,
        speed: 300,
        text: 'AI calisiyor'
    }
};
```

### Ozel Tetikleyici Ekleme

```javascript
const TRIGGERS = [
    { trigger: ':email', replace: 'ornek@email.com' },
    { trigger: ':tel', replace: '+90 555 123 4567' },
    { trigger: ':imza', replace: 'Saygilarimla,\nAd Soyad' },
    // Dinamik deger
    { trigger: ':yil', replace: () => new Date().getFullYear().toString() }
];
```

---

## Arayuz

### Loading Gostergesi
AI islemi sirasinda animasyonlu bir gosterge goruntulenir:

```
+----------------------------------+
|  [*] AI calisiyor...  | ESC iptal |
+----------------------------------+
```

### Ceviri Tooltip
Secilen metin icin modern bir tooltip ile ceviri gosterilir:

```
        +---------------------+
        |   Merhaba Dunya     |
        +---------^-----------+
              "Hello World"
```

---

## Gizlilik ve Guvenlik

- API anahtariniz sadece yerel tarayicinizda saklanir
- Ceviri icin Google Translate API kullanilir
- Discord webhook URL'niz gizli tutulmalidir
- Tum baglantilar HTTPS uzerinden yapilir

---

## Bilinen Sorunlar

- Bazi sitelerde contenteditable alanlarla uyumsuzluk olabilir
- React/Vue gibi framework'lerde state senkronizasyonu gecikmeli olabilir

---

## Lisans

Bu proje MIT lisansi altinda lisanslanmistir. Detaylar icin [LICENSE](LICENSE) dosyasina bakin.

---

## Yazar

**emrcaca**

- GitHub: [@emrcaca](https://github.com/emrcaca)

---

<div align="center">

⭐ Bu projeyi begendiniz mi? Yildiz vermeyi unutmayin!

</div>
