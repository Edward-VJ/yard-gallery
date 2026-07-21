// One-off: adds the notFound.{title,body,cta} keys (needed for YG-5's
// localized 404 page) to all 13 locale message files. Low-risk, standard
// UI phrases — translated directly, not via subagents like the main
// content in YG-4.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MESSAGES_DIR = path.join(ROOT, "messages");

const TRANSLATIONS = {
  lt: { title: "Puslapis nerastas", body: "Šio puslapio nėra arba jis buvo perkeltas.", cta: "Grįžti į pradžią" },
  en: { title: "Page Not Found", body: "This page doesn't exist or has been moved.", cta: "Back to home" },
  ru: { title: "Страница не найдена", body: "Такой страницы не существует или она была перемещена.", cta: "Вернуться на главную" },
  pl: { title: "Nie znaleziono strony", body: "Ta strona nie istnieje lub została przeniesiona.", cta: "Wróć do strony głównej" },
  uk: { title: "Сторінку не знайдено", body: "Такої сторінки не існує або вона була переміщена.", cta: "Повернутися на головну" },
  de: { title: "Seite nicht gefunden", body: "Diese Seite existiert nicht oder wurde verschoben.", cta: "Zurück zur Startseite" },
  fr: { title: "Page introuvable", body: "Cette page n'existe pas ou a été déplacée.", cta: "Retour à l'accueil" },
  es: { title: "Página no encontrada", body: "Esta página no existe o ha sido movida.", cta: "Volver al inicio" },
  pt: { title: "Página não encontrada", body: "Esta página não existe ou foi movida.", cta: "Voltar ao início" },
  it: { title: "Pagina non trovata", body: "Questa pagina non esiste o è stata spostata.", cta: "Torna alla home" },
  ja: { title: "ページが見つかりません", body: "このページは存在しないか、移動されました。", cta: "ホームに戻る" },
  zh: { title: "页面未找到", body: "此页面不存在或已被移动。", cta: "返回首页" },
  ko: { title: "페이지를 찾을 수 없습니다", body: "이 페이지는 존재하지 않거나 이동되었습니다.", cta: "홈으로 돌아가기" },
};

for (const [locale, notFound] of Object.entries(TRANSLATIONS)) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
  messages.notFound = notFound;
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + "\n");
  console.log(`✓ ${locale}.json`);
}
