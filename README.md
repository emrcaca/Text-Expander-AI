# Text-Expander-AI
Kısayol genişletici ve AI destekli metin işleme özellikleri sunan bir Tampermonkey userscript'i.

## Özellikler

- Yaygın kısaltmaların otomatik genişletilmesi (brb, omw, idk, vb.)
- AI destekli metin işlemleri:
  - Gramer ve yazım düzeltme (-fix)
  - Metin geliştirme ve detaylandırma (-gen)
  - Metin iyileştirme ve güçlendirme (-imp)
  - İngilizce-Türkçe çeviri (-en, -tr)
- OpenAI GPT-3.5-Turbo entegrasyonu
- Tüm metin giriş alanlarında çalışabilme

## Kurulum

1. [Tampermonkey](https://www.tampermonkey.net/) eklentisini tarayıcınıza yükleyin
2. Bu script'i yeni bir userscript olarak ekleyin
3. OpenAI API anahtarınızı girin
4. Herhangi bir metin alanına kısayolları yazarak kullanmaya başlayın

## Kullanım

### Basit Kısaltmalar
- `brb` → be right back
- `omw` → on my way
- `idk` → I don't know
- `ty` → thank you
- `np` → no problem
- `btw` → by the way
- `asap` → as soon as possible
- `gg` → good game

### AI Komutları
- `-fix` - Metindeki gramer, yazım ve noktalama hatalarını düzeltir
- `-gen` - Fikri daha detaylı ve kapsamlı bir versiyona geliştirir
- `-imp` - Metni daha açık, öz ve etkileyici hale getirir
- `-en` - Metni İngilizce'ye çevirir
- `-tr` - Metni Türkçeye çevirir

Kullanmak için komuttan sonra işlemek istediğiniz metni yazın ve boşluk tuşuna basın.

Örnek: `Bu bir test yazısıdır -fix`

## Gereksinimler

- Tarayıcıda yüklü Tampermonkey eklentisi
- Aktif OpenAI API anahtarı

## Lisans

MIT
