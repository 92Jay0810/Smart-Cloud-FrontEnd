const template_url = process.env.REACT_APP_TEMPLATE_URL;
const template_data = [
  {
    id: 1,
    caption: "現代化 WEB 站台架構",
    subtitle: "平台：GCP",
    subtitle2: "作者：Frankie",
    content:
      "簡介：這個架構圖適用於高流量的動態網站，使用External HTTPS Load Balancing結合Cloud Armor，比傳統的單一負載均衡器提供更完整的流量控制和安全防護。並透過 Cloud Run 部署 API 服務，具備自動擴縮容能力且更符合成本效益。且透過Cloud Storage管理靜態資源，Cloud SQL處理資料存儲，比起全部存放在應用服務器更有效率。Artifact Registry 管理容器影像。",
    image: template_url + "/WEBAPI/template.drawio.png",
    backendAPI: "WEBAPI",
    plamform: "GCP",
  },
  {
    id: 2,
    caption: "無伺服器WEB應用架構",
    subtitle: "平台：GCP",
    subtitle2: "作者：Rich",
    content:
      "簡介：這個架構圖呈現無伺服器 Web 應用架構。流量透過 External Application Load Balancer 進入，並由 Cloud Armor 提供 WAF 保護。前端和後端 API 皆使用 Cloud Run 無伺服器運行，內部透過 IAM Permissions 進行權限管理。使用 Firestore 取代關聯式資料庫 (如 Cloud SQL)，提供更適合無伺服器應用的 NoSQL 結構，減少維護成本。敏感資訊則由 Secret Manager 管理。",
    image:
      template_url +
      "/serverless_web_application/serverless_web_application.png",
    backendAPI: "serverless_web_application",
    plamform: "GCP",
  },
  {
    id: 3,
    caption: "事件驅動架構ETL",
    subtitle: "平台：GCP",
    subtitle2: "作者：Rich",
    content:
      "簡介：這個架構圖以事件驅動為核心，當用戶上傳檔案到Cloud Storage後，會觸發事件通知到Pub/Sub系統，再根據需求分流到批次處理(Batch Processing)或串流處理(Stream Data Processing)。最終數據會存入Data Warehouse。整體架構具備完整的營運管理功能，並對敏感資料進行特別管理。",
    image: template_url + "/event_driven_ETL/event_driven_ETL.png",
    backendAPI: "event_driven_ETL",
    plamform: "GCP",
  },
  {
    id: 4,
    caption: "資料庫架構CDC",
    subtitle: "平台：GCP",
    subtitle2: "作者：Rich",
    content:
      "簡介：這個架構圖使用 Database Migration Service 進行CDC串流處理，能即時捕獲源資料庫的變更，相比傳統的批次同步，可更快保持資料一致性。透過 Cloud VPN 和 VPN Gateway 建立加密通道，確保地端到雲端的資料傳輸安全。Cloud SQL 作為資料庫，具自動擴展和備份功能，比自建資料庫更容易管理和維護。且此架構圖明確區分本地端和雲端，通過嚴格的網路隔離和存取控制，確保資料安全性和合規性。",
    image: template_url + "/database_CDC/database_CDC.png",
    backendAPI: "database_CDC",
    plamform: "GCP",
  },
  {
    id: 5,
    caption: "內部員工教育平台",
    subtitle: "平台：AWS",
    subtitle2: "作者：Smart Archie",
    content:
      "簡介：這個架構圖適用於內部員工教育平台等系統。後端採用EKS管理容器化服務，並使用EFS和ElastiCache存儲課程資源和快取，使用CloudFront和ELB處理內容分發，相比傳統單一伺服器部署，提供更快速和穩定的課程存取體驗。並搭配使用CloudWatch 監控系統狀態，X-Ray 輔助問題排查。",
    image: template_url + "/education_platform/education_platform.png",
    backendAPI: "education_platform",
    plamform: "AWS",
  },
  {
    id: 6,
    caption: "串接不同資訊Chatbot",
    subtitle: "平台：AWS",
    subtitle2: "作者：Smart Archie",
    content:
      "簡介：這個架構圖適用於需整合各類服務的聊天機器人系統，透過Route 53處理用戶請求，經由公開和私有子網路的分層設計提升安全性。系統使用NAT Gateway管理網路流量，並運用ElastiCache提供快取服務，相較於直接存取資料庫顯著提升響應速度和減輕資料庫負載。後端採用RDS MySQL儲存資料，提供自動備份和擴展功能。最後整合CloudWatch 監控系統狀態和安全管理(IAM、WAF)機制，確保安全性。",
    image: template_url + "/chatbot/chatbot.png",
    backendAPI: "chatbot",
    plamform: "AWS",
  },
  {
    id: 7,
    caption: "多媒體串流服務",
    subtitle: "平台：GCP",
    subtitle2: "作者：Kite",
    content:
      "簡介：這個架構圖的特點在於強調高效內容分發與低延遲體驗。它結合了 Cloud CDN、Cloud Armor 及 Global Load Balancer，確保來自不同區域的用戶都能獲得穩定的串流服務。相比一般 Web 應用架構，它強調即時性與高併發處理，並利用 Cloud Storage 作為媒體來源，透過 Cloud Pub/Sub 及監控工具 來確保播放品質。適用於大型影音平台、直播服務及點播系統，確保流量高峰時的穩定性與安全性。",
    image:
      template_url + "/media_streaming_service/media_streaming_service.png",
    backendAPI: "media_streaming_service",
    plamform: "GCP",
  },
  {
    id: 8,
    caption: "跨雲傳輸",
    subtitle: "平台：GCP",
    subtitle2: "作者：Mike",
    content:
      "簡介：這個架構圖的特點在於跨雲整合，透過 GCP 與 AWS 之間的 IPSec VPN 隧道建立安全連線，並進一步串接 AWS Transit Gateway 以優化內部流量管理。與一般單點 VPN 連線不同，本架構利用高可用 VPN（HA VPN Gateway）與雙線路（線路 A/B）提升連線可靠性，確保異常時仍可維持業務運行。此外，透過多機房 HA Firewall 部署，進一步強化內部安全性，使其特別適用於對網路韌性要求極高的企業雲網路整合方案。",
    image: template_url + "/Cross_Cloud_Transfer/Cross_Cloud_transfer.png",
    backendAPI: "Cross_Cloud_Transfer",
  },
];
export default template_data;
