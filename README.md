##图书管理系统
###1、数据库设计
本系统数据使用Nosql型数据库mongodb将数据存储于books数据库中，自PHP+Mysql之后Nodejs+Mongodb可谓是新生技术中的又一黄金搭档。本系统设计了三个集合（collection），分别是：books（存储图书相关信息）、users（存储用户相关信息）、lendhistory（存储借/还书历史）。
#####1.1 books集合
books集合用于存储图书相关信息，其中包含以下文档（字段）：`bookname`(图书名称)、`pic`（图书缩略图）、`author`（图书作者）、`publish_house`（出版社）、`publish_date`（出版日期）、`borrow_times`（借阅次数）、`score`（总体评分）、`recommend`（推荐阅读信息）、`book_cate`（图书分类）、`isbn`（图书ISBN编码）、`book_number`（可借册数）。

其中，以下文档需做特殊说明：

- `bookname`、`book_cate`、`isbn`、`book_number`为必填字段；
- `borrow_times`是非固定字段，可以在图书第一次被借阅时加入集合；
- `book_cate`字段非常关键，将用于与管理员关联，以便管理员按类别分类管理图书增删及借换情况；
- `book_number`字段除了记录图书可借册数外，还用于判断图书状态是否可借；
- `isbn`字段用于图书去重；

表格(省去可扩展字段)展示形式如下：

|bookname|pic|author|publish_house|publish_date|recommend|book_cate|isbn|book_number|
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---:|:---:|:---:|
|PS教程|http://....png|XXX|邮电出版社|2013-01-01|推荐阅读|1|123456789|3|

#####1.2 users集合
users集合数据本身不由本系统创建，该集合数据由ark登录成功后返回用户信息写入，这样可以保证登入用户都是有效的系统内部用户，避免外部用户干扰。该集合包含以下文档（字段）：`nick`（用户昵称/旺旺）、`email`（用户邮箱）、`work_id`（工号）、`isadmin`（是否管理员标记）。

其中，以下文档需做特殊说明：

- `email`字段可用于从gravatar获取用户头像；
- `work_id`字段可用于用户去重处理；
- `isadmin`字段用于标记改用户是否管理员，标记值使用图书类别，这样就可以让管理员与其所管理的图书类别自然关联；

表格展示形式如下：

|nick|email|work_id|isadmin|
|:---:|:---:|:---:|:---:|
|乐淘|mailxxx@gmail.com|12345|0/1/2/3|

#####1.3 lendhistory集合
lendhistory集合用于存储用户借书/还书的整个过程，也兼任查询借阅历史的角色，该集合包含以下文档（字段）：`nick`（用户昵称）、`isbn`（图书标识）、`bookname`（图书名称）、`borrom_time`（借阅时间）、`return_time`（规定的还书时间）、`status`（接/还书状态标识）、`book_cate`（图书类别）。

其中，以下需做特殊说明：

- 可通过`nick`与`isbn`对应，查阅用户借书史/图书借阅史。
- `borrow_time`和`return_time`之间是合理的借阅时间，即将达到规定还书时间还未还书的将给予邮件提醒；
- `status`标识借/审/还/审状态，暂定分别以1,2,3,4标识；
- `book_cate`用于管理员分类审核自己管理类别的图书借阅状态；

表格展示形式如下：

|nick|isbn|bookname|borrow_time|return_time|status|book_cate|
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|乐淘|123456789|jQuery|2013-01-01|2013-02-01|1/2/3/4|1|

###2.时序图
![添加图书](http://img03.taobaocdn.com/tps/i3/T1QedwXApXXXX.6wL7-517-544.png)
![编辑图书](http://img02.taobaocdn.com/tps/i2/T1jv4uXw0fXXacMbYy-604-329.png)
![删除图书](http://img01.taobaocdn.com/tps/i1/T1nuVvXw0bXXbrPcwX-492-404.png)
![借书](http://img04.taobaocdn.com/tps/i4/T1a_8tXsJdXXXJI_zZ-591-864.png)
![还书](http://img03.taobaocdn.com/tps/i3/T13PNvXB4aXXc6mJgV-551-257.png)
###3.状态图
![状态图](http://img02.taobaocdn.com/tps/i2/T1_j0uXuheXXXU7b60-514-374.png)
###4.一些资料
-   nodejs文档：<http://nodejs.org/api/>
-   express文档：<http://expressjs.com/api.html>
-   mongoskin教程：<http://www.hacksparrow.com/mongoskin-tutorial-with-examples.html>(目前没有完整的mongoskin文档)
-   jade文档：<https://github.com/visionmedia/jade>
-   markdown文档：<http://daringfireball.net/projects/markdown/syntax>  


以生产环境启动：  

Mac：$ export NODE_ENV=production  

windows: set NODE_ENV=production  


*开发前请绑定本地host为book.etao.net*，目前远程数据库使用[mongolab](https://mongolab.com/)