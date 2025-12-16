# Text-Expander-AI + Hover Translator

Yapay zeka destekli metin genişletme ve hover çeviri özelliklerini birleştiren bir userscript.

[English README](README.en.md)

## Özellikler

### Text Expander
- Otomatik olarak önceden tanımlı metne dönüşen özel tetikleyiciler tanımlama
- Metin işleme için yapay zeka destekli komutlar (dil bilgisi düzeltme, özetleme, ton ayarlama vb.)
- Ctrl+Z / Ctrl+Y ile geri al/ileri al desteği
- Genişletmeden hemen sonra Backspace ile hızlı geri alma

### Hover Translator
- Google Translate kullanarak seçili metni otomatik çevirir
- Birden fazla hedef dili destekler (Türkçe, İngilizce, Almanca, Fransızca, İspanyolca)
- Daha iyi performans için çevirileri önbelleğe alır
- Kaynak ve hedef dil aynı olduğunda çeviriyi atlar

## Kurulum

1. Bir userscript yöneticisi yükleyin (Tampermonkey, Violentmonkey vb.)
2. Yeni bir script oluşturun ve `Userscript.js` içeriğini yapıştırın
3. Ayarlar panelinden API ayarlarınızı yapılandırın

## Kullanım

### AI Komutları
Metninizi yazın ve sonuna bir komut ekleyin:
```
metniniz burada -fix
```

Varsayılan komutlar:

| Komut | Açıklama |
|-------|----------|
| `-ai` | Genel yapay zeka asistanı |
| `-tr` | Türkçeye çeviri |
| `-en` | İngilizceye çeviri |
| `-fix` | Dil bilgisi, yazım ve noktalama hatalarını düzeltir |
| `-imp` | Anlam koruyarak stil ve okunabilirliği geliştirir |
| `-enh` | İçeriği detaylar ve örneklerle zenginleştirir |
| `-sum` | Tek cümlede özetler |
| `-frm` | Resmi, profesyonel tonda yeniden yazar |
| `-cas` | Samimi, günlük tonda yeniden yazar |
| `--eng` | AI promptu oluşturur |
| `--enh` | Mevcut promptu geliştirir |
| `--imp` | Prompt yapısını ve tonunu iyileştirir |

### Tetikleyiciler
Önceden tanımlı metinle otomatik değiştirmek için bir tetikleyici kelime yazın.

Varsayılan tetikleyiciler:

| Tetikleyici | Değer |
|-------------|-------|
| `hi`, `hello`, `hey` | Selamlama mesajları |
| `selam`, `bye`, `gorusuruz` | Türkçe selamlama/vedalaşma |
| `thanks`, `thankyou` | Teşekkür mesajları |
| `:tel` | Telefon numarası |
| `:email` | E-posta adresi |
| `:address` | Adres bilgisi |
| `:yardım`, `:help` | Yardım mesajı |
| `office_hours`, `calisma_saatleri` | Çalışma saatleri |
| `support`, `faq` | Destek bilgileri |
| `website`, `instagram`, `twitter`, `linkedin` | Sosyal medya linkleri |
| `whatsapp`, `iletisim` | İletişim bilgileri |
| `pricing`, `randevu` | Fiyat ve randevu bilgileri |
| `acil`, `konum` | Acil durum ve konum |
| `newsletter`, `privacy`, `terms` | Bülten ve yasal linkler |

### Çeviri
Bir web sayfasında herhangi bir metni seçin ve tooltip'te çevirisini görün.

## Yapılandırma

Ayarlara userscript menüsü üzerinden erişin (userscript yöneticisi simgesine tıklayın ve "Ayarlar"ı seçin).

### Ayar Sekmeleri
- **Genel**: Özellikleri etkinleştir/devre dışı bırak, API yapılandırması, hedef dil
- **Komutlar**: Özel promptlarla AI komutları ekle/kaldır
- **Tetikleyiciler**: Metin tetikleyicileri ekle/kaldır
- **Yardım**: Klavye kısayolları ve kullanım kılavuzu

### API Yapılandırması
- **URL**: OpenAI uyumlu API endpoint'iniz
- **Key**: API anahtarınız
- **Model**: Kullanılacak model adı
- **Timeout**: İstek zaman aşımı (varsayılan: 60000ms)

## Klavye Kısayolları

| İşlem | Kısayol |
|-------|---------|
| Geri Al | Ctrl+Z |
| İleri Al | Ctrl+Y |
| Hızlı Geri Al | Backspace (genişletmeden hemen sonra) |
| İptal | ESC |

## Gereksinimler

- Userscript yöneticisi (Tampermonkey, Violentmonkey, Greasemonkey)
- AI komutları için OpenAI uyumlu API endpoint'i

## Lisans

MIT
