# [S&S(Shop&Share)](https://shauncc.site/)
![img](img_readme/homepage.png)
---
## 專案主旨
本專案為一拍賣網站，但功能注重在團購的商品，並非一般商品，  
旨在讓團購主可以透過 S&S 並且根據各種不同的成團條件發出團購商品，  
而其餘使用者則可在首頁瀏覽到各種商品，以及下單
## 重點特色
* 團購商品  
包含上架團購商品，下單團購商品，瀏覽團購商品，管理團購商品，管理目前訂購商品，下單團購商品
* 圖文留言板  
任何使用者都可以在圖文留言板留下希望他人開任意的團購商品，或任意形式的文章
* 聊天功能  
讓賣家與買家能夠及時通訊交流
* 金流管控  
所有交易金流必須經過 S&S 後賣家才能提取金額，並且設置管理員身分以供會計使用
## 次要特色
* 第三方登入(Google OAuth 2.0)
* 第三方金流(TapPay)
* 註冊驗證信
* 通知功能
* 搜尋功能
* 上傳圖片壓縮
## 使用技術
* Frond-End  
HTML.CSS.JavaScript  
部分以 Bootsrap 建置
* Back-End
MVC架構    
Python 框架為 Flask  
RESTful API
* Database  
1. MySQL
2. 網站部分以 ORM(Flask-SQLAlchemy) 進行操作
3. 設置 Index 加速搜尋
* Cloud
1. 網站架設於 AWS EC2
2. 資料庫使用 AWS RDS(雲端關聯式資料庫)
3. 圖片皆儲存於 AWS S3(Simple Cloud Storage)
4. 圖片呈現利用 AWS CloudFront
5. 快取及 Session 儲存於 AWS ElastiCache
6. 通知系統結合 AWS lambda 以及 AWS CloudWatch 定時排程通知
* Other
1. 上傳圖片若超過一定大小則進行壓縮(OpenCV)
2. 註冊需經過信箱驗證才能發起團購(Flask-mail)
3. 利用Redis進行快取設置(volatile-lru)以及 Session 管理
4. 以 Flask-Migrate 進行資料庫版本管理
5. 以 WebSocket 實作即時聊天功能
6. HTTPS以 Nginx 配合 SSL 憑證
## 資料庫結構
![img](img_readme/database.png)
