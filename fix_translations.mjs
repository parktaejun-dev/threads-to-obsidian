import fs from 'fs';

let content = fs.readFileSync('packages/web-client/src/lib/web-i18n.ts', 'utf8');

// ==== 1. Replace Exact Keys with inbox/받은함/etc. translations ====
const inboxLabels = {
  ko: "저장됨",
  en: "Saved",
  ja: "保存済み",
  "pt-BR": "Salvos",
  es: "Guardado",
  "zh-TW": "珍藏",
  vi: "Đã lưu"
};

// Safer manual replacement approach
const koReplacements = [
  ['scrapbookTabInbox: "받은함"', 'scrapbookTabInbox: "저장됨"'],
  ['scrapbookInboxEyebrow: "받은함"', 'scrapbookInboxEyebrow: "저장됨"'],
  ['scrapbookInboxTitle: "받은함"', 'scrapbookInboxTitle: "저장됨"'],
  ['"Threads 계정을 연결하면 받은함과 클라우드 저장 항목이 여기에 나타납니다."', '"Threads 계정을 연결하면 저장됨과 클라우드 백업 항목이 여기에 함께 나타납니다."'],
  ['"Threads 계정을 연결하면 받은함과 클라우드 저장 항목이 여기에 함께 나타납니다."', '"Threads 계정을 연결하면 저장됨과 클라우드 백업 항목이 여기에 함께 나타납니다."'],
  ['scrapbookFilterAutoArchiveLabel: "받은함 저장"', 'scrapbookFilterAutoArchiveLabel: "자동 저장"'],
  ['scrapbookWatchlistAutoArchive: "새로 찾은 게시물을 받은함에도 저장"', 'scrapbookWatchlistAutoArchive: "새로 찾은 게시물을 자동 저장"'],
  ['scrapbookSearchAutoArchive: "찾은 글을 받은함에도 저장"', 'scrapbookSearchAutoArchive: "찾은 글을 자동 저장"'],
  ['"받은함, 클라우드 저장, 모니터링에서 자동 저장된 항목이 여기에 모입니다."', '"멘션 저장 및 모니터링을 통해 보관된 항목들이 여기에 모입니다."'],
  ['scrapbookStatusTrackedSaved: "게시물을 받은함에 보관했습니다."', 'scrapbookStatusTrackedSaved: "게시물을 저장했습니다."'],
  ['scrapbookStatusSearchArchived: "검색 결과를 받은함에 저장했습니다."', 'scrapbookStatusSearchArchived: "검색 결과를 저장했습니다."'],
  ['scrapbookStatusInsightSaved: "게시물을 받은함에 보관했습니다."', 'scrapbookStatusInsightSaved: "게시물을 저장했습니다."'],
  
  // scrapbook related in ko
  ['"공개 댓글은 트리거 역할만 하고, 저장된 결과는 내 scrapbook에만 보입니다."', '"공개 댓글은 트리거 역할만 하고, 결과는 내 비공개 저장됨 페이지에만 보입니다."'],
  ['"이 scrapbook은 @{handle} 계정에 연결되어 있습니다."', '"현재 웹 환경은 @{handle} 계정에 연결되어 있습니다."'],
  ['"웹 scrapbook에서 저장 상태를 확인하고 Markdown 복사나 다운로드로 다음 툴로 넘깁니다."', '"웹 저장됨 페이지에서 항목을 확인하고 Markdown 복사 혹은 다운로드로 다음 툴로 넘깁니다."'],
  ['"\\"{title}\\" 항목을 scrapbook에서 삭제할까요?"', '"\\"{title}\\" 항목을 저장됨에서 삭제할까요?"'],
  ['"scrapbook 상태를 불러오지 못했습니다."', '"저장된 상태를 불러오지 못했습니다."'],
  ['"여기서는 내 scrapbook 소유 계정만 연결합니다."', '"여기서는 내 저장됨을 소유할 계정만 연결합니다."']
];

for (const [from, to] of koReplacements) {
  content = content.replace(from, to);
}

// ==== EN ====
const enReplacements = [
  ['scrapbookTabInbox: "Inbox"', 'scrapbookTabInbox: "Saved"'],
  ['scrapbookInboxEyebrow: "Inbox"', 'scrapbookInboxEyebrow: "Saved"'],
  ['scrapbookInboxTitle: "Inbox"', 'scrapbookInboxTitle: "Saved"'],
  ['"Connect your Threads account to see your inbox and cloud saves here."', '"Connect your Threads account to see your saved items and cloud saves here."'],
  ['"Save to inbox"', '"Auto-save"'],
  ['"Save matched posts to inbox"', '"Auto-save matched posts"'],
  ['"Connect your Threads account to see your inbox and cloud saves here as well."', '"Connect your Threads account to see your saved items and cloud saves here as well."'],
  ['"Your inbox, cloud saves, and automatically saved items from watchlists gather here."', '"Your saved items, cloud backups, and automatically saved items from watchlists gather here."'],
  ['"Archived the tracked post to your inbox."', '"Saved the tracked post."'],
  ['"Saved the search results to your inbox."', '"Saved the search results."'],
  ['"Archived the post to your inbox."', '"Saved the post."'],
  ['"The public reply is just a trigger, and the stored result is only visible in your scrapbook."', '"The public reply is just a trigger, and the stored result is only visible in your Saved page."'],
  ['"This scrapbook is linked to the @{handle} account."', '"This workspace is linked to the @{handle} account."'],
  ['"Check the saved status in the web scrapbook and hand it over to the next tool via Markdown copy or download."', '"Check the saved status in your web Saved page and hand it over to the next tool via Markdown copy or download."'],
  ['"Delete the \\"{title}\\" item from your scrapbook?"', '"Delete the \\"{title}\\" item from Saved?"'],
  ['"Failed to load scrapbook status."', '"Failed to load saved status."'],
  ['"Only connect the account that owns your scrapbook here."', '"Only connect the account that owns your saved items here."']
];

for (const [from, to] of enReplacements) {
  content = content.replace(from, to);
}

const jaReplacements = [
  ['scrapbookTabInbox: "受信箱"', 'scrapbookTabInbox: "保存済み"'],
  ['scrapbookInboxEyebrow: "受信箱"', 'scrapbookInboxEyebrow: "保存済み"'],
  ['scrapbookInboxTitle: "受信箱"', 'scrapbookInboxTitle: "保存済み"'],
  ['"Threads アカウントを連携すると、受信箱とクラウド保存項目がここに表示されます。"', '"Threads アカウントを連携すると、保存済みアイテムやクラウドバックアップがここに表示されます。"'],
  ['"Threads アカウントを連携すると、受信箱とクラウド保存項目がここにも表示されます。"', '"Threads アカウントを連携すると、保存済みアイテムやクラウドバックアップがここにも表示されます。"'],
  ['"受信箱に保存"', '"自動保存"'],
  ['"見つけた投稿を受信箱にも保存"', '"見つけた投稿を自動保存"'],
  ['"見つけた内容を受信箱にも保存"', '"見つけた内容を自動保存"'],
  ['"受信箱、クラウド保存、モニタリングから自動保存された項目がここに集まります。"', '"保存済み、クラウドバックアップ、モニタリングからの自動保存アイテムがここに集まります。"'],
  ['"投稿を受信箱に保存しました。"', '"投稿を保存しました。"'],
  ['"検索結果を受信箱に保存しました。"', '"検索結果を保存しました。"'],
  ['"公開リプライはトリガーの役割のみで、保存された結果は自分の scrapbook にのみ表示されます。"', '"公開リプライはトリガーの役割のみで、保存された結果は自分の 保存済み ページにのみ表示されます。"'],
  ['"この scrapbook は @{handle} アカウントと連携しています。"', '"このワークスペースは @{handle} アカウントと連携しています。"'],
  ['"ウェブの scrapbook で保存状態を確認し、Markdown コピーやダウンロードで次のツールに渡します。"', '"ウェブの 保存済み ページで状態を確認し、Markdown コピーやダウンロードで次のツールに渡します。"'],
  ['"スクラップブックから削除しますか？"', '"保存済みから削除しますか？"'],
  ['"scrapbook の状態を読み込めませんでした。"', '"保存状態を読み込めませんでした。"'],
  ['"自分の scrapbook を所有するアカウントのみをここに連携してください。"', '"自分の保存済みアイテムを所有するアカウントのみをここに連携してください。"']
];

for (const [from, to] of jaReplacements) {
  content = content.replace(from, to);
}

const ptReplacements = [
  ['scrapbookTabInbox: "Bandeja"', 'scrapbookTabInbox: "Salvos"'],
  ['scrapbookInboxEyebrow: "Bandeja"', 'scrapbookInboxEyebrow: "Salvos"'],
  ['scrapbookInboxTitle: "Bandeja"', 'scrapbookInboxTitle: "Salvos"'],
  ['"Vincule sua conta Threads para ver sua bandeja e itens salvos na nuvem aqui."', '"Vincule sua conta Threads para ver seus itens salvos e backups na nuvem aqui."'],
  ['"Salvar na bandeja"', '"Salvar automático"'],
  ['"Também salvar os posts encontrados na bandeja"', '"Salvar automaticamente os posts encontrados"'],
  ['"Vincule sua conta Threads para ver sua bandeja e itens salvos na nuvem aqui também."', '"Vincule sua conta Threads para ver seus itens salvos e backups na nuvem aqui também."'],
  ['"Itens da bandeja, salvos na nuvem e itens salvados automaticamente de monitoramentos se reúnem aqui."', '"Itens salvos, backups na nuvem e salvamentos automáticos de monitoramentos se reúnem aqui."'],
  ['"O post monitorado foi arquivado na sua bandeja."', '"O post monitorado foi salvo."'],
  ['"Resultados da pesquisa salvos na sua bandeja."', '"Resultados da pesquisa foram salvos."'],
  ['"Post arquivado na sua bandeja."', '"Post salvo."'],
  ['"A resposta pública é apenas um gatilho, e o resultado armazenado fica visível apenas no seu scrapbook."', '"A resposta pública é apenas um gatilho, e o resultado armazenado fica visível apenas na sua página Salvos."'],
  ['"Este scrapbook está vinculado à conta @{handle}."', '"Este espaço está vinculado à conta @{handle}."'],
  ['"Verifique o status do salvamento no scrapbook da web e passe para a próxima ferramenta via cópia Markdown ou download."', '"Verifique o status do salvamento na sua página Salvos na web e passe para a próxima ferramenta via cópia Markdown ou download."'],
  ['"Excluir o item \\"{title}\\" do seu scrapbook?"', '"Excluir o item \\"{title}\\" de Salvos?"'],
  ['"Apenas conecte a conta proprietária do seu scrapbook aqui."', '"Apenas conecte a conta proprietária dos seus itens salvos aqui."']
];
for (const [from, to] of ptReplacements) {
  content = content.replace(from, to);
}

const esReplacements = [
  ['scrapbookTabInbox: "Bandeja"', 'scrapbookTabInbox: "Guardado"'],
  ['scrapbookInboxEyebrow: "Bandeja"', 'scrapbookInboxEyebrow: "Guardado"'],
  ['scrapbookInboxTitle: "Bandeja"', 'scrapbookInboxTitle: "Guardado"'],
  ['"Vincule su cuenta de Threads para ver su bandeja y guardados en la nube aquí."', '"Vincule su cuenta de Threads para ver sus elementos guardados y copias de seguridad en la nube aquí."'],
  ['"Guardar en la bandeja"', '"Guardado automático"'],
  ['"Guardar también los posts encontrados en la bandeja"', '"Guardar automáticamente posts encontrados"'],
  ['"Vincule su cuenta de Threads para ver su bandeja y guardados en la nube aquí también."', '"Vincule su cuenta de Threads para ver sus elementos guardados y copias de seguridad en la nube aquí también."'],
  ['"Los elementos de la bandeja, guardados en la nube y guardados automáticamente por el seguimiento se recopilan aquí."', '"Lo guardado, respaldos en la nube y contenido automático se recopilan aquí."'],
  ['"El post fue archivado a su bandeja."', '"El post fue guardado."'],
  ['"Resultados de la búsqueda guardados a su bandeja."', '"Resultados de la búsqueda fueron guardados."'],
  ['"Post archivado a su bandeja."', '"Post guardado."'],
  ['"La respuesta pública es solo el activador, y el resultado almacenado solo es visible en tu scrapbook."', '"La respuesta pública es solo el activador, y el resultado almacenado solo es visible en tu página Guardado."'],
  ['"Este scrapbook está vinculado a la cuenta @{handle}."', '"Este espacio está vinculado a la cuenta @{handle}."'],
  ['"Verifique el estado guardado en el scrapbook web y entréguelo a la siguiente herramienta mediante una copia de Markdown o una descarga."', '"Verifique el estado guardado en la página Guardado y páselo a la siguiente herramienta mediante Markdown o descarga."'],
  ['"¿Eliminar el elemento \\"{title}\\" de su scrapbook?"', '"¿Eliminar el elemento \\"{title}\\" de Guardados?"'],
  ['"Conecta solo la cuenta propietaria de tu scrapbook aquí."', '"Conecta solo la cuenta propietaria de tus elementos guardados aquí."']
];
for (const [from, to] of esReplacements) {
  content = content.replace(from, to);
}

const zhReplacements = [
  ['scrapbookTabInbox: "收件匣"', 'scrapbookTabInbox: "珍藏"'],
  ['scrapbookInboxEyebrow: "收件匣"', 'scrapbookInboxEyebrow: "珍藏"'],
  ['scrapbookInboxTitle: "收件匣"', 'scrapbookInboxTitle: "珍藏"'],
  ['"連結你的 Threads 帳號，以在這裡查看收件匣與雲端儲存項目。"', '"連結你的 Threads 帳號，以在這裡查看珍藏項目與雲端備份。"'],
  ['"連結你的 Threads 帳號，以在這裡一併查看收件匣與雲端儲存項目。"', '"連結你的 Threads 帳號，以在這裡一併查看珍藏項目與雲端備份。"'],
  ['"保存到收件匣"', '"自動儲存"'],
  ['"找出的貼文也存進收件匣"', '"找出的貼文也自動儲存"'],
  ['"找出的內容也存進收件匣"', '"找出的內容也自動儲存"'],
  ['"收件匣、雲端儲存與從監控中自動儲存的項目都會集中在這裡。"', '"珍藏清單、雲端備份與監控中自動儲存的項目都會集中在這裡。"'],
  ['"已將追蹤的貼文封存到收件匣。"', '"已儲存追蹤的貼文。"'],
  ['"已將搜尋結果儲存至收件匣。"', '"已儲存搜尋結果。"'],
  ['"已將貼文封存到收件匣。"', '"已儲存貼文。"'],
  ['"公開留言只是一個觸發器，保存的結果只會顯示在你的私人 scrapbook 中。"', '"公開留言只是一個觸發器，保存的結果只會顯示在你的珍藏頁面中。"'],
  ['"這個 scrapbook 已連結到 @{handle} 帳號。"', '"這個工作空間已連結到 @{handle} 帳號。"'],
  ['"在網頁 scrapbook 中確認儲存狀態，然後透過 Markdown 複製或下載匯出至其他工具。"', '"在網頁珍藏頁面中確認儲存狀態，然後透過 Markdown 複製或下載匯出至其他工具。"'],
  ['"要從 scrapbook 中刪除「{title}」項目嗎？"', '"要從珍藏頁面中刪除「{title}」項目嗎？"'],
  ['"請在這裡只連結擁有你 scrapbook 的帳號。"', '"請在這裡只連結擁有你珍藏項目的帳號。"']
];
for (const [from, to] of zhReplacements) {
  content = content.replace(from, to);
}

const viReplacements = [
  ['scrapbookTabInbox: "Hộp nhận"', 'scrapbookTabInbox: "Đã lưu"'],
  ['scrapbookInboxEyebrow: "Hộp nhận"', 'scrapbookInboxEyebrow: "Đã lưu"'],
  ['scrapbookInboxTitle: "Hộp nhận"', 'scrapbookInboxTitle: "Đã lưu"'],
  ['"Liên kết tài khoản Threads để xem hộp nhận và các mục lưu trữ đám mây tại đây."', '"Liên kết tài khoản Threads để xem các mục đã lưu và sao lưu đám mây tại đây."'],
  ['"Lưu vào hộp nhận"', '"Tự động lưu"'],
  ['"Lưu luôn các bài viết vừa tìm được vào hộp nhận"', '"Tự động lưu các bài viết vừa tìm được"'],
  ['"Lưu luôn các bài vừa tìm được vào hộp nhận"', '"Tự động lưu các bài vừa tìm được"'],
  ['"Liên kết tài khoản Threads để xem cả hộp nhận và mục lưu trữ đám mây tại đây."', '"Liên kết tài khoản Threads để xem cả mục đã lưu và sao lưu đám mây tại đây."'],
  ['"Hộp nhận, lưu trữ đám mây và các mục tự động lưu từ việc theo dõi sẽ được tập hợp tại đây."', '"Mục đã lưu, sao lưu đám mây và tự động lưu từ theo dõi sẽ tập hợp tại đây."'],
  ['"Đã lưu bài viết theo dõi vào hộp nhận của bạn."', '"Đã lưu bài viết."'],
  ['"Đã lưu kết quả tìm kiếm vào hộp nhận của bạn."', '"Đã lưu kết quả tìm kiếm."'],
  ['"Đã lưu bài viết vào hộp nhận của bạn."', '"Đã lưu bài viết."'],
  ['"Bình luận công khai chỉ mang tính kích hoạt, còn kết quả lưu chỉ hiển thị trong scrapbook riêng của bạn."', '"Bình luận công khai chỉ mang tính kích hoạt, còn kết quả lưu chỉ hiển thị ở trang Đã lưu riêng của bạn."'],
  ['"Scrapbook này được liên kết với tài khoản @{handle}."', '"Không gian này được liên kết với tài khoản @{handle}."'],
  ['"Xóa mục \\"{title}\\" khỏi scrapbook của bạn?"', '"Xóa mục \\"{title}\\" khỏi mục Đã lưu của bạn?"'],
  ['"Kiểm tra trạng thái lưu trong trang web scrapbook và chuyển tiếp sang công cụ tiếp theo qua sao chép Markdown hoặc tải xuống."', '"Kiểm tra trạng thái lưu trong trang web Đã lưu và chuyển tiếp sang công cụ tiếp theo qua sao chép Markdown hoặc tải xuống."'],
  ['"Chỉ liên kết tài khoản sở hữu scrapbook của bạn ở đây."', '"Chỉ liên kết tài khoản sở hữu các mục đã lưu của bạn ở đây."']
];
for (const [from, to] of viReplacements) {
  content = content.replace(from, to);
}

// Ensure vi Inbox fallback
content = content.replace(/scrapbookTabInbox:\s*"Inbox"/g, 'scrapbookTabInbox: "Đã lưu"');
content = content.replace(/scrapbookInboxEyebrow:\s*"Inbox"/g, 'scrapbookInboxEyebrow: "Đã lưu"');
content = content.replace(/scrapbookInboxTitle:\s*"Inbox"/g, 'scrapbookInboxTitle: "Đã lưu"');

fs.writeFileSync('packages/web-client/src/lib/web-i18n.ts', content);
console.log("Translation replacement done.");
