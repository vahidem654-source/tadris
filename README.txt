نصب روی GitHub Pages (مثل دفعه‌ی قبل):
۱) همه‌ی فایل‌های این پوشه را — این ۱۱ فایل (README لازم نیست)، بدون ساختن پوشه — در ریشه‌ی مخزن آپلود کن (Add file ← Upload files، همه را با هم بکش و رها کن):
   index.html, board.html, studio.js, pptx.js, jszip.min.js, pdf.min.mjs, pdf.worker.min.mjs, openjpeg.wasm, jbig2.wasm, qcms_bg.wasm,
   sw.js, manifest.webmanifest, icon-192.png, icon-512.png
   (فایل‌های قبلی با همین نام را جایگزین کن.)
۲) اگر فایل‌های pdf.min.mjs و pdf.worker.min.mjs آپلود نشوند، ورود PDF کار نمی‌کند؛ اگر pptx.js یا jszip.min.js نباشند، ورود PPTX کار نمی‌کند.
۳) بعد از یکی دو دقیقه صفحه را باز کن؛ اگر نسخه‌ی قبلی را می‌بینی، برنامه را ببند و دوباره باز کن (یا در sw.js مقدار V را عوض کن).
فونت بی‌نازنین: فایل BNazanin.ttf را کنار index.html بگذار (اختیاری).

نکته: سه فایل openjpeg.wasm و jbig2.wasm و qcms_bg.wasm برای نمایش تصویرهای داخل PDF لازم‌اند (بدون آن‌ها بعضی تصاویر PDF سفید دیده می‌شوند).
