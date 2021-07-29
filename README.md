# [S&S(Shop&Share)](https://shauncc.site/)
---
## 專案主旨
本專案為一拍賣網站,但功能注重在團購的商品,並非一般商品,  
旨在讓團購主可以透過S&S並且根據各種不同的成團條件發出團購商品,  
而其餘使用者則可在首頁瀏覽到各種商品,以及下單
## 重點特色
* 團購商品  
包含上架團購商品,下單團購商品,瀏覽團購商品,管理團購商品,管理目前訂購商品,下單團購商品
* 圖文留言板  
任何使用者都可以在圖文留言板留下希望他人開任意的團購商品,或任意形式的文章
* 聊天功能  
讓賣家與買家能夠及時通訊交流
* 金流管控  
所有交易金流必須經過S&S後賣家才能提取金額,並且設置管理員身分以供會計使用
## 次要特色
* 第三方登入(google)
* 第三方金流(tappay)
* 註冊驗證信
* 通知功能
* 搜尋功能
* 上傳圖片壓縮
## 使用技術
* Frond-End  
html.css.javascript.部分以bootsrap建置
* Back-End
MVC架構    
python flask  
RESTful API
* Database  
1. MySql
2. 網站部分以ORM(flask-sqlalchemy)進行操作
3. 設置Index加速搜尋
* Cloud
1. 網站架設於AWS EC2
2. 資料庫使用AWS RDS(雲端關聯式資料庫)
3. 圖片皆儲存於AWS S3(Simple Cloud Storage)
4. 圖片呈現利用AWS CloudFront
5. 快取及Session儲存於ElastiCache
6. 通知系統結合AWS lambda以及AWS CloudWatch定時排程通知
* Other
1. 上傳圖片若超過一定大小則進行壓縮(OpenCV)
2. 註冊需經過信箱驗證才能發起團購(Flask-mail)
3. 利用Redis進行快取設置(volatile-lru)以及Session管理
4. 以Flask-Migrate進行資料庫版本管理
5. 以WebSocket實作即時聊天功能
