<!-- 本文件为 MAP 技能的参考示例，是 Agent skills/MAP.md 提到的 references/MAP.md，仅建立关联、不做内容优化。 -->
<!-- 相关笔记：本技能的中文使用说明见 [[Agent skills/MAP]]。 -->

# 项目架构与核心代码索引地图

> 本文档用于快速定位代码、排查 Bug、理解系统架构

---

## 一、项目全局技术栈与架构概览

**后端架构：** Spring Boot 3.3.3 + Spring Security + JWT + JPA + MySQL 8.0 + Redis（Spring Data Redis + Redisson），采用分层架构（Controller → Service → Repository → Entity），AI 模块通过 WebClient 调用 LLM API。Redis 承担两类职责：① 房源详情缓存（`@Cacheable` + 缓存穿透空标记保护 + 手动刷新 + 命中率监控）；② 房源预订分布式锁（Redisson RLock 防超卖）。安全方面：JWT 实时查库校验角色与状态、全链路数据隔离、全局请求体分页限制（200 条）、响应安全头注入。Swagger 默认关闭（`springdoc.api-docs.enabled=false`），仅开发环境（`application-dev.yml`）开启。

**前端架构：** Vue 3 + Vite 5 + Vue Router 4 + Pinia + Element Plus，采用双平台设计（公开平台 `/` + 后台管理 `/manage`），Axios 封装统一请求拦截。

**通信方式：**
- **开发环境：** Vite Proxy 代理 `/api` → `http://localhost:8080`
- **生产环境：** Nginx 反向代理 `/api` → 后端容器，`/` → 前端静态资源

---

## 二、后端核心目录与文件索引

```
backend/src/main/java/com/houserent/
├── HouseRentalApplication.java          # Spring Boot 启动类
│
├── auth/                                 # 【认证模块】登录、注册、JWT、用户管理
│   ├── controller/
│   │   ├── AuthController.java          # 登录/注册接口（/api/auth/**）
│   │   └── UserController.java          # 用户管理接口（/api/admin/users）
│   ├── service/
│   │   └── AuthService.java             # 认证业务逻辑（密码校验、Token 生成；注册硬编码 TENANT）
│   ├── repository/
│   │   └── UserRepository.java          # 用户数据访问（findByUsername）
│   ├── entity/
│   │   └── SysUser.java                 # 用户实体（对应 sys_user 表）
│   ├── dto/
│   │   ├── LoginRequest.java            # 登录请求参数
│   │   ├── RegisterRequest.java         # 注册请求参数（仅 username/password/realName/phone/email，无 role 字段）
│   │   └── LoginResponse.java           # 登录响应（token + userInfo）
│   ├── config/
│   │   └── SecurityConfig.java          # Spring Security 配置（CORS 白名单 + 权限规则 + JWT 过滤器注册）
│   └── filter/
│       ├── JwtTokenProvider.java        # JWT 工具类（生成/解析/验证 Token）
│       └── JwtAuthenticationFilter.java # JWT 过滤器（拦截请求、校验 Token、**实时查库校验角色与状态**）
│
├── modules/
│   ├── house/                            # 【房源模块】房源增删改查、详情缓存、预订
│   │   ├── controller/
│   │   │   └── HouseController.java     # 房源接口（公开列表/详情/预订 + 管理端 CRUD + 缓存刷新）
│   │   ├── service/
│   │   │   └── HouseService.java        # 房源业务（搜索/分页/审核 + getById/getByIdCached 缓存 + bookHouse 分布式锁；公开详情仅返回 APPROVED 状态）
│   │   ├── repository/
│   │   │   └── HouseRepository.java     # 房源数据访问（JpaSpecificationExecutor）
│   │   ├── entity/
│   │   │   └── House.java               # 房源实体（对应 house 表，含 booked 已预订字段，实现 Serializable）
│   │   └── dto/
│   │       ├── HouseQueryRequest.java   # 查询参数（关键词、价格、区域等）
│   │       └── HouseRequest.java        # 创建/更新请求参数
│   │
│   ├── contract/                         # 【合同模块】合同管理
│   │   ├── controller/
│   │   │   └── ContractController.java  # 合同接口（/api/admin/contracts；租客端协商需 userId/role 参数）
│   │   ├── service/
│   │   │   └── ContractServiceImpl.java # 合同业务逻辑（含所有权校验：租客只能操作自己的合同，房东只能操作自己房源的合同）
│   │   ├── repository/
│   │   │   └── ContractRepository.java  # 合同数据访问
│   │   └── entity/
│   │       └── Contract.java            # 合同实体（对应 contract 表）
│   │
│   ├── repair/                           # 【报修模块】报修管理
│   │   ├── controller/
│   │   │   └── RepairController.java    # 报修接口（/api/admin/repairs；租客端提交/查看详情需 userId/role 参数）
│   │   ├── service/
│   │   │   └── RepairServiceImpl.java   # 报修业务逻辑（含所有权校验：租客只能操作自己的报修，房东只能操作自己房源的报修）
│   │   ├── repository/
│   │   │   └── RepairRepository.java    # 报修数据访问
│   │   └── entity/
│   │       └── Repair.java              # 报修实体（对应 repair 表）
│   │
│   ├── rent/                             # 【交租模块】租金管理
│   │   ├── controller/
│   │   │   └── RentPaymentController.java # 交租接口（/api/admin/rents）
│   │   ├── service/
│   │   │   ├── RentPaymentService.java   # 交租服务接口
│   │   │   ├── RentPaymentServiceImpl.java # 交租业务逻辑
│   │   │   ├── RentCalculationService.java # 应收租金动态计算服务（按合同有效期）
│   │   │   └── RentPaymentScheduler.java  # 定时任务（每月自动生成 UNPAID 账单）
│   │   ├── repository/
│   │   │   └── RentPaymentRepository.java  # 交租数据访问
│   │   ├── entity/
│   │   │   └── RentPayment.java         # 交租实体（对应 rent_payment 表，含 expectedAmount 字段）
│   │   └── dto/
│   │       └── RentPaymentWithExpected.java # 交租记录 DTO（含应收金额 expectedAmount）
│   │
│   ├── message/                          # 【消息模块】站内消息
│   │   ├── controller/
│   │   │   └── MessageController.java   # 消息接口（/api/admin/messages；标记已读需 userId 参数）
│   │   ├── service/
│   │   │   └── MessageServiceImpl.java  # 消息业务逻辑（含所有权校验：标记已读时验证消息接收人）
│   │   ├── repository/
│   │   │   └── MessageRepository.java   # 消息数据访问
│   │   └── entity/
│   │       └── Message.java             # 消息实体（对应 message 表）
│   │
│   ├── announcement/                     # 【公告模块】公告管理
│   │   ├── controller/
│   │   │   └── AnnouncementController.java # 公告接口（/api/admin/announcements）
│   │   ├── service/
│   │   │   ├── AnnouncementService.java # 公告服务接口
│   │   │   └── impl/
│   │   │       └── AnnouncementServiceImpl.java # 公告业务逻辑
│   │   ├── repository/
│   │   │   └── AnnouncementRepository.java # 公告数据访问
│   │   └── entity/
│   │       └── Announcement.java        # 公告实体（对应 announcement 表）
│   │
│   ├── appointment/                      # 【预约模块】看房预约
│   │   ├── controller/
│   │   │   └── AppointmentController.java # 预约接口（/api/appointment）
│   │   ├── service/
│   │   │   └── AppointmentServiceImpl.java # 预约业务逻辑
│   │   ├── repository/
│   │   │   └── AppointmentRepository.java  # 预约数据访问
│   │   ├── entity/
│   │   │   └── Appointment.java         # 预约实体（对应 appointment 表）
│   │   └── dto/
│   │       ├── AppointmentRequest.java  # 预约请求参数
│   │       └── AppointmentResponse.java # 预约响应参数
│   │
│   ├── dashboard/                        # 【仪表盘模块】数据统计
│   │   ├── controller/
│   │   │   └── DashboardController.java # 仪表盘接口（GET /api/admin/dashboard/stats）
│   │   ├── service/
│   │   │   ├── DashboardService.java    # 仪表盘服务接口
│   │   │   └── impl/
│   │   │       └── DashboardServiceImpl.java # 仪表盘业务逻辑（角色数据统计）
│   │   └── dto/
│   │       └── DashboardStats.java      # 仪表盘统计数据传输对象
│   │
│   └── ai/                               # 【AI 模块】智能对话助手
│       ├── controller/
│       │   └── AiController.java        # AI 对话接口（POST /api/public/ai/chat）
│       ├── service/
│       │   ├── AiService.java           # AI 服务接口
│       │   └── AiServiceImpl.java       # AI 核心实现（LLM 调用 + 降级逻辑）
│       └── dto/
│           ├── ChatRequest.java         # 对话请求（用户消息）
│           └── ChatResponse.java        # 对话响应（文本 + 房源列表）
│
└── common/                               # 【公共模块】全局配置、异常处理、文件服务、Redis 基础设施
    ├── config/
    │   ├── WebMvcConfig.java            # CORS 跨域配置 + 静态资源映射（环境变量白名单）
    │   ├── RedisConfig.java             # Redis 基础设施：RedisTemplate（JSON 序列化）+ RedisCacheManager（缓存注解 + 统计）
    │   ├── RedissonConfig.java          # Redisson 分布式锁配置（提供 RedissonClient Bean）
    │   ├── PageSizeLimitFilter.java     # 请求体分页大小限制过滤器（防止批量拉取，默认限制 200 条）
    │   └── SecurityHeadersFilter.java   # 响应安全头注入过滤器（X-Content-Type-Options 等）
    ├── controller/
    │   ├── FileController.java          # 文件上传控制器（POST /api/upload, POST /api/upload/batch）
    │   └── CacheMetricsController.java  # 缓存监控接口（GET /cache/stats 命中率, GET /cache/keys 缓存 key 列表）
    ├── service/
    │   └── FileService.java             # 文件服务（文件上传、验证、存储、删除；含 MIME 类型校验）
    ├── util/
    │   └── RedisService.java            # Redis 操作工具类（set/get/delete，含 TTL 重载）
    ├── constant/
    │   ├── RoleConstant.java            # 角色常量（ADMIN, LANDLORD, TENANT）
    │   └── HouseStatusConstant.java     # 房源状态常量（PENDING, APPROVED, REJECTED）
    ├── dto/
    │   ├── ApiResponse.java             # 统一响应格式（code + message + data）
    │   └── PageRequest.java             # 分页请求基类
    └── exception/
        ├── BusinessException.java       # 业务异常（自定义错误码）
        └── GlobalExceptionHandler.java  # 全局异常处理器（@ControllerAdvice）
```

---

## 三、前端核心目录与文件索引

```
frontend/src/
├── main.js                               # Vue 应用入口（挂载路由、Pinia、Element Plus）
├── App.vue                               # 根组件（<router-view />）
│
├── router/
│   └── index.js                          # 【路由配置】路由定义 + 路由守卫（登录拦截、权限校验、调试日志）
│
├── stores/
│   └── user.js                           # 【Pinia 状态管理】用户信息、Token 存储（sessionStorage）、角色格式统一处理
│
├── api/                                  # 【API 封装层】
│   ├── request.js                        # Axios 实例（请求/响应拦截器、Token 注入，sessionStorage）
│   ├── upload.js                         # 文件上传 API（单文件上传、批量上传）
│   ├── house.js                          # 公开房源 API（列表、详情）
│   ├── admin.js                          # 管理端认证 API（登录、退出）
│   ├── adminHouse.js                     # 管理端房源 API（CRUD）
│   ├── adminContract.js                  # 管理端合同 API（CRUD、协商）
│   ├── adminRepair.js                    # 管理端报修 API（列表、处理）
│   ├── adminRent.js                      # 管理端交租 API（列表、确认）
│   ├── adminMessage.js                   # 管理端消息 API（列表、发送、租客留言）
│   ├── adminAnnouncement.js              # 管理端公告 API（CRUD）
│   ├── adminUser.js                      # 管理端用户 API（CRUD、禁用/启用、房东审核）
│   ├── adminDashboard.js                 # 管理端仪表盘 API（统计数据）
│   ├── profile.js                        # 个人信息 API（获取、更新、修改密码）
│   ├── appointment.js                    # 预约 API（创建、查询、取消）
│   └── ai.js                             # AI 对话 API
│
├── public/                               # 【公开租赁平台】租客访问
│   └── views/
│       ├── home/
│       │   └── index.vue                 # 首页（搜索框 + 房源列表）
│       ├── houses/
│       │   └── index.vue                 # 房源列表页
│       ├── ai/
│       │   └── index.vue                 # AI 对话助手页面
│       ├── login/
│       │   ├── index.vue                 # 登录页
│       │   └── register.vue              # 注册页
│       ├── appointment/
│       │   └── index.vue                 # 看房预约页
│       └── about/
│           └── index.vue                 # 关于我们
│
└── admin/                                # 【后台管理系统】管理员/房东访问
    ├── layout/
    │   └── index.vue                     # 后台布局（侧边栏 + 顶部导航）
    └── views/
        ├── login/
        │   └── index.vue                 # 后台登录页
        ├── dashboard/
        │   └── index.vue                 # 仪表盘（数据统计）
        ├── houses/
        │   └── index.vue                 # 房源管理（列表 + 新增/编辑弹窗）
        ├── contracts/
        │   └── index.vue                 # 合同管理
        ├── repairs/
        │   └── index.vue                 # 报修管理
        ├── rents/
        │   └── index.vue                 # 交租管理
        ├── announcements/
        │   └── index.vue                 # 公告管理
        ├── messages/
        │   └── index.vue                 # 站内消息
        ├── users/
        │   └── index.vue                 # 用户管理
        └── profile/
            └── index.vue                 # 个人信息
```

---

## 四、核心业务功能 → 代码文件映射表

| 业务功能 | 涉及的前端文件 | 涉及的后端文件 | 排查该功能 Bug 时的切入点 |
| :--- | :--- | :--- | :--- |
| **用户登录** | `public/views/login/index.vue`<br>`admin/views/login/index.vue`<br>`api/request.js`<br>`stores/user.js` | `auth/controller/AuthController.java`<br>`auth/service/AuthService.java`<br>`auth/filter/JwtTokenProvider.java` | 1. 检查前端请求参数格式<br>2. 检查后端密码校验逻辑<br>3. 检查 JWT 生成与解析<br>4. 检查 Token 是否正确存储到 sessionStorage |
| **JWT 鉴权拦截** | `api/request.js`（自动添加 Token）<br>`router/index.js`（路由守卫） | `auth/filter/JwtAuthenticationFilter.java`<br>`auth/config/SecurityConfig.java` | 1. 检查前端请求头是否携带 `Authorization: Bearer xxx`<br>2. 检查后端 Security 白名单配置<br>3. 检查 Token 是否过期 |
| **租客搜索房源** | `public/views/home/index.vue`<br>`api/house.js` | `modules/house/controller/HouseController.java`<br>`modules/house/service/HouseService.java`<br>`modules/house/repository/HouseRepository.java` | 1. 检查前端传参（page, size, keyword）<br>2. 检查后端 Specification 动态查询构建<br>3. 检查数据库索引（district, price） |
| **房源详情查询（Redis 缓存）** | `public/views/houses/index.vue`<br>`api/house.js` | `modules/house/controller/HouseController.java`（getPublicHouseDetail）<br>`modules/house/service/HouseService.java`（getById + getByIdCached）<br>`common/config/RedisConfig.java` | 1. 缓存 key = `cache:house:{id}`，TTL 10 分钟（RedisConfig 按缓存名配置）<br>2. 命中日志 `Cache hit - house:{id}`；未命中 `Cache miss - house:{id}, querying DB`<br>3. `@Cacheable` 命中短路、未命中查库并回写<br>4. 命中判断走 RedisTemplate（不计入 RedisCache 统计），真实读取统一走 `@Cacheable` |
| **缓存穿透保护** | 同上 | `modules/house/service/HouseService.java`（getByIdCached） | 1. id 不存在时写入空标记 `house:empty:{id}`（5 分钟过期）<br>2. 命中空标记直接抛"房源不存在"，不再查库<br>3. 排查：Redis 中 `KEYS house:empty:*` |
| **手动刷新房源缓存** | `public/views/houses/detail.vue`（详情页"刷新缓存"按钮）<br>`api/house.js`（refreshHouseCache） | `modules/house/controller/HouseController.java`（refreshCache，GET /api/public/houses/{id}/refresh） | 1. 删除 `cache:house:{id}` 与空标记 `house:empty:{id}`<br>2. 用于房源信息变更后立即让缓存失效 |
| **缓存一致性（更新/删除失效）** | `admin/views/houses/index.vue`<br>`api/adminHouse.js` | `modules/house/service/HouseService.java`（updateHouse / deleteHouse） | 1. 策略：先更新 DB 再删缓存（key = `cache:house:{id}`），删缓存包 try-catch 失败仅记日志<br>2. 为什么"先更新 DB 再删缓存"：避免"先删缓存再更新 DB"的窗口期内并发请求读到旧数据并回写缓存，造成脏数据长期驻留 |
| **房源预订（分布式锁）** | `public/views/houses/detail.vue`（详情页"立即预订"按钮，已预订时禁用）<br>`api/house.js`（bookHouse） | `modules/house/controller/HouseController.java`（bookHouse，POST /api/public/houses/{id}/book）<br>`modules/house/service/HouseService.java`（bookHouse + doBookHouse）<br>`common/config/RedissonConfig.java` | 1. 锁 key = `lock:house:{id}`，tryLock 等待 5 秒 / 租约 10 秒<br>2. 锁内 double-check `booked` 状态，已预订则拒绝，防止超卖<br>3. 锁须在事务提交后才释放（非事务方法加锁 → 代理调用 @Transactional 的 doBookHouse → finally 释放）<br>4. 获取锁失败返回 409"房源正在被预订，请稍后重试" |
| **缓存监控（命中率）** | 无前端（Postman / 运维调用） | `common/controller/CacheMetricsController.java`（GET /cache/stats、GET /cache/keys）<br>`common/config/RedisConfig.java`（withStatisticsCollector 开启统计） | 1. /cache/stats 返回精确 gets / hits / misses / hitRate<br>2. /cache/keys 用 SCAN 遍历 `cache:*` 与 `house:empty:*`（非阻塞）<br>3. /cache/** 不在 Security 白名单，需带 JWT 访问 |
| **房东发布房源** | `admin/views/houses/index.vue`<br>`api/adminHouse.js` | `modules/house/controller/HouseController.java`<br>`modules/house/service/HouseService.java` | 1. 检查前端 FormData 构建<br>2. 检查后端 `@PreAuthorize("hasRole('ADMIN')")` 权限拦截<br>3. 检查房源状态默认值（PENDING） |
| **合同管理** | `admin/views/contracts/index.vue`<br>`api/adminContract.js` | `modules/contract/controller/ContractController.java`<br>`modules/contract/service/ContractService.java`<br>`modules/contract/repository/ContractRepository.java` | 1. 检查合同编号生成逻辑<br>2. 检查合同状态流转<br>3. 检查关联房源和租客数据 |
| **合同协商** | `admin/views/contracts/index.vue`<br>`api/adminContract.js` | `modules/contract/controller/ContractController.java`<br>`modules/contract/service/ContractService.java`<br>`modules/contract/entity/Contract.java` | 1. 检查协商状态流转（NONE→PENDING→APPROVED/REJECTED）<br>2. 检查租客发起协商的权限校验<br>3. 检查房东审批协商的权限校验<br>4. 检查协商内容 JSON 解析逻辑 |
| **报修管理** | `admin/views/repairs/index.vue`<br>`api/adminRepair.js` | `modules/repair/controller/RepairController.java`<br>`modules/repair/service/RepairService.java`<br>`modules/repair/repository/RepairRepository.java` | 1. 检查报修状态流转（PENDING→PROCESSING→COMPLETED）<br>2. 检查处理人权限校验<br>3. 检查报修时间记录 |
| **交租管理** | `admin/views/rents/index.vue`<br>`api/adminRent.js` | `modules/rent/controller/RentPaymentController.java`<br>`modules/rent/service/RentPaymentService.java`<br>`modules/rent/repository/RentPaymentRepository.java` | 1. 检查租金计算逻辑<br>2. 检查支付状态更新<br>3. 检查逾期判断逻辑 |
| **应收租金动态计算** | `admin/views/rents/index.vue`<br>`admin/views/dashboard/index.vue` | `modules/rent/service/RentCalculationService.java`<br>`modules/rent/dto/RentPaymentWithExpected.java`<br>`modules/rent/entity/RentPayment.java`（expectedAmount 字段）<br>`modules/dashboard/service/DashboardServiceImpl.java` | 1. 根据合同 `startDate` 和 `endDate` 动态判断目标月份是否在有效期内<br>2. 有效期内返回合同 `price`，否则返回 0<br>3. 仪表盘和交租管理都基于此逻辑展示应收金额<br>4. 支持按租客/房东/管理员三种角色聚合应收数据 |
| **租客发起合同协商** | `admin/views/contracts/index.vue`<br>（"发起协商"按钮 + 协商弹窗）<br>`api/adminContract.js` | `modules/contract/controller/ContractController.java`<br>（POST /api/admin/contracts/{id}/negotiate）<br>`modules/contract/service/ContractServiceImpl.java`<br>（initiateNegotiation 方法） | 1. 检查合同状态必须为 ACTIVE<br>2. 检查无正在进行中的协商（negotiationStatus != PENDING）<br>3. 检查发起人必须是合同租客<br>4. 检查协商内容 JSON 格式正确 |
| **站内消息** | `admin/views/messages/index.vue`<br>`api/adminMessage.js` | `modules/message/controller/MessageController.java`<br>`modules/message/service/MessageService.java`<br>`modules/message/repository/MessageRepository.java` | 1. 检查消息类型过滤<br>2. 检查已读状态更新<br>3. 检查未读消息计数 |
| **看房预约** | `public/views/appointment/index.vue`<br>`api/appointment.js` | `modules/appointment/controller/AppointmentController.java`<br>`modules/appointment/service/AppointmentService.java`<br>`modules/appointment/repository/AppointmentRepository.java` | 1. 检查预约时间冲突检测<br>2. 检查预约状态流转<br>3. 检查房源可用性校验 |
| **AI 智能推荐房源** | `public/views/ai/index.vue`<br>`api/ai.js` | `modules/ai/controller/AiController.java`<br>`modules/ai/service/AiServiceImpl.java` | 1. 检查前端传参格式（message 字段）<br>2. 检查后端 `parseHouseQuery` 正则解析<br>3. 检查 `LLM_API_KEY` 环境变量是否配置<br>4. 检查 LLM API 响应格式（choices[0].message.content） |
| **AI 降级为本地搜索** | 同上 | `modules/ai/service/AiServiceImpl.java`<br>（`parseHouseQuery` 方法） | 1. 检查 LLM_API_KEY 是否为空<br>2. 检查正则表达式匹配逻辑<br>3. 检查数据库查询条件构建 |
| **个人信息管理** | `admin/views/profile/index.vue`<br>`api/profile.js` | `auth/controller/AuthController.java`<br>`auth/service/AuthService.java` | 1. 检查用户信息更新逻辑<br>2. 检查密码修改验证<br>3. 检查头像上传处理 |
| **数据隔离** | 各管理页面 | `modules/*/service/impl/*ServiceImpl.java`<br>（ContractServiceImpl, RepairServiceImpl, RentPaymentServiceImpl） | 1. 检查 Service 层是否根据用户角色过滤数据<br>2. 检查租客只能看到自己的数据<br>3. 检查房东只能看到自己房源的数据<br>4. 检查管理员可以看到所有数据 |
| **仪表盘数据统计** | `admin/views/dashboard/index.vue`<br>`api/adminDashboard.js` | `modules/dashboard/controller/DashboardController.java`<br>`modules/dashboard/service/DashboardService.java`<br>`modules/dashboard/dto/DashboardStats.java` | 1. 检查统计数据是否从数据库实时查询<br>2. 检查不同角色的统计数据是否正确<br>3. 检查统计接口是否需要认证 |
| **公告管理** | `admin/views/announcements/index.vue`<br>`api/adminAnnouncement.js` | `modules/announcement/controller/AnnouncementController.java`<br>`modules/announcement/service/AnnouncementService.java`<br>`modules/announcement/entity/Announcement.java` | 1. 检查公告的 CRUD 操作<br>2. 检查公告的发布状态管理<br>3. 检查公告的权限控制 |
| **用户管理** | `admin/views/users/index.vue`<br>`api/adminUser.js` | `auth/controller/UserController.java`<br>`auth/service/AuthService.java`<br>`auth/entity/SysUser.java` | 1. 检查用户列表查询<br>2. 检查用户禁用/启用功能<br>3. 检查用户角色分配<br>4. 检查管理员权限控制<br>5. 检查房东审核功能（reviewLandlord API） |
| **路由权限控制** | `router/index.js`<br>`stores/user.js` | 无（前端逻辑） | 1. 检查 `meta.requiresAuth` 配置<br>2. 检查 `meta.roles` 角色权限<br>3. 检查 sessionStorage 中的 token 和 role |
| **跨域请求** | `vite.config.js`（proxy 配置） | `common/config/WebMvcConfig.java`（CORS 配置） | 1. 开发环境：检查 Vite proxy 配置<br>2. 生产环境：检查 Nginx 反向代理<br>3. 检查后端 CORS 允许的域名 |
| **统一异常处理** | 无（前端通过 Axios 拦截器处理） | `common/exception/GlobalExceptionHandler.java`<br>`common/exception/BusinessException.java` | 1. 检查后端异常是否被 `@ExceptionHandler` 捕获<br>2. 检查返回的 `ApiResponse` 格式<br>3. 检查前端 Axios 响应拦截器 |
| **文件上传服务** | `admin/views/profile/index.vue`（头像上传）<br>`admin/views/houses/index.vue`（房源图片上传）<br>`admin/views/repairs/index.vue`（报修附件上传）<br>`admin/views/contracts/index.vue`（合同附件上传）<br>`api/upload.js` | `common/controller/FileController.java`<br>`common/service/FileService.java`<br>`common/config/WebMvcConfig.java`（静态资源映射）<br>`auth/entity/SysUser.java`（avatar 字段）<br>`modules/house/entity/House.java`（images 字段）<br>`modules/repair/entity/Repair.java`（attachments 字段）<br>`modules/contract/entity/Contract.java`（attachments 字段） | 1. 检查文件类型验证（jpg/png/pdf）<br>2. 检查文件大小限制（10MB）<br>3. 检查文件存储路径配置（`file.upload-path`）<br>4. 检查静态资源映射（`/uploads/**`）<br>5. 检查实体类字段是否支持文件 URL 存储 |

---

## 五、配置文件与部署文件速查

| 文件路径 | 作用 | 修改它能解决什么问题 |
| :--- | :--- | :--- |
| **后端配置** | | |
| `backend/pom.xml` | 后端 Maven 依赖 | 添加/升级依赖：Redis（`spring-boot-starter-data-redis` + `commons-pool2`）、Redisson（`org.redisson:redisson` 分布式锁） |
| `backend/src/main/resources/application.yml` | 主配置文件（数据库、JWT、AI、Redis、日志级别） | 修改数据库连接、JWT 密钥、LLM API、Redis（host/port/database/lettuce 连接池）、日志级别（均使用环境变量 `${ENV_VAR:default}`，Redis 默认 `localhost:6379`）；生产环境默认禁用 Swagger |
| `backend/src/main/resources/application-dev.yml` | 开发环境配置 | 开启 SQL 日志、调整日志级别（使用环境变量）；Swagger 开发环境开启 |
| `backend/src/main/resources/application-prod.yml` | 生产环境配置 | 生产环境数据库、关闭调试信息 |
| `backend/src/main/resources/db/init.sql` | 数据库初始化脚本 | 修改表结构、添加默认数据 |
| **前端配置** | | |
| `frontend/vite.config.js` | Vite 构建配置 | 修改开发服务器端口、代理规则、构建输出目录 |
| `frontend/package.json` | 依赖管理 | 添加/升级 npm 包 |
| **部署配置** | | |
| `docker-compose.yml` | Docker 编排（MySQL + Backend + Frontend + Nginx） | 修改容器端口、环境变量、数据卷挂载 |
| `nginx/default.conf` | Nginx 反向代理配置 | 修改路由规则、API 代理、静态资源缓存 |
| `backend/Dockerfile` | 后端 Docker 镜像构建 | 修改 JDK 版本、构建参数 |
| `frontend/Dockerfile` | 前端 Docker 镜像构建 | 修改 Node 版本、构建命令 |
| **环境变量** | | |
| `.env`（项目根目录） | 环境变量（不提交到 Git） | 配置 `LLM_API_KEY`、`JWT_SECRET`、数据库密码；Redis 可选（`REDIS_HOST`/`REDIS_PORT`/`REDIS_DATABASE`/`REDIS_PASSWORD`，缺省时使用 application.yml 默认值） |
| `.env.example`（项目根目录） | 环境变量模板文件 | 提供配置示例，开发者复制后修改为 `.env` |
| `.gitignore`（项目根目录） | Git 忽略规则 | 确保敏感文件不被提交到版本控制 |
| `SECURITY_CONFIG.md`（项目根目录） | 安全配置指南 | 详细说明敏感信息配置步骤和安全机制 |

---

## 六、常见排障场景速查

### 场景 1：前端请求后端 401 Unauthorized

**排查路径：**
1. 检查浏览器 Network 面板 → 请求头是否携带 `Authorization: Bearer xxx`
2. 检查 `frontend/src/api/request.js` → 请求拦截器是否正确注入 Token
3. 检查 `frontend/src/stores/user.js` → Token 是否存储到 sessionStorage
4. 检查后端 `auth/filter/JwtAuthenticationFilter.java` → Token 解析是否成功，实时查库校验角色与状态
5. 检查 Token 是否过期（`jwt.expiration` 配置）

### 场景 2：AI 对话功能无响应

**排查路径：**
1. 检查 `.env` 文件 → `LLM_API_KEY` 是否配置
2. 检查后端日志 → 是否看到 "LLM API Key 未配置，使用本地正则解析"
3. 检查 `modules/ai/service/AiServiceImpl.java` → `callLlm` 方法是否抛出异常
4. 检查 LLM API 响应 → 是否返回 `choices[0].message.content`
5. 检查网络 → 能否访问 `https://api.deepseek.com`

### 场景 3：房源搜索结果为空

**排查路径：**
1. 检查前端传参 → `HouseQueryRequest` 字段是否正确
2. 检查后端 `HouseService.buildSpecification` → 动态查询条件是否正确
3. 检查数据库 → `house` 表中是否有 `status = 'APPROVED'` 的数据
4. 检查 SQL 日志 → 实际执行的 SQL 语句是什么（开启 `show-sql: true`）

### 场景 4：跨域请求失败

**排查路径：**
1. **开发环境：** 检查 `frontend/vite.config.js` → proxy 配置是否正确
2. **生产环境：** 检查 `nginx/default.conf` → `/api/` 代理是否配置
3. 检查后端 `common/config/WebMvcConfig.java` → CORS 允许的域名是否包含前端地址

### 场景 5：数据库连接失败

**排查路径：**
1. 检查 `application.yml` → 数据库 URL、用户名、密码是否正确
2. 检查 MySQL 服务是否启动 → `systemctl status mysql` 或 `docker-compose ps mysql`
3. 检查数据库是否存在 → `SHOW DATABASES;`
4. 检查用户权限 → `GRANT ALL ON house_rental.* TO 'root'@'localhost';`

### 场景 6：AI 对话接口返回 500 错误
排查路径：

1. 检查后端日志 → 是否有 LazyInitializationException 或事务相关异常
2. 检查 AiServiceImpl.getResponse 方法 → 是否添加了 @Transactional(readOnly = true)
3. 检查 JPA 查询 → 是否在事务上下文中执行
4. 检查 spring.jpa.open-in-view 配置 → 是否为 true（默认 true）
5. 检查实体类关联关系 → 是否有懒加载字段在事务外访问

### 场景 7：Redis 连接失败（缓存 / 分布式锁不可用）

**排查路径：**
1. 检查 Redis 是否启动 → `redis-cli ping`（应返回 `PONG`）
2. 检查 `application.yml` → `spring.data.redis` 的 host / port / password / database
3. 检查环境变量 → `REDIS_HOST`、`REDIS_PORT`、`REDIS_PASSWORD` 是否被错误设置
4. 检查 `RedisConfig.java` 与 `RedissonConfig.java` → 两个连接配置是否一致
5. 注意：Lettuce 连接是惰性的，**应用启动不会报错**，首次读写缓存/获取锁时才暴露问题

### 场景 8：缓存命中率低 / 缓存不生效

**排查路径：**
1. 调用 `GET /cache/stats` → 查看 hitRate / hits / misses
2. 检查后端日志 → 是否打印 `Cache hit / Cache miss - house:{id}`
3. 检查缓存 key → 必须为 `cache:house:{id}`（刷新/删除缓存的 key 与 `@Cacheable` 一致，见 `HOUSE_CACHE_KEY_PREFIX`）
4. 检查 `RedisConfig.java` → house 缓存 TTL（10 分钟）与序列化配置
5. 检查 Redis 中实际数据 → `KEYS cache:house:*`、`TTL cache:house:1`
6. 检查缓存统计是否开启 → RedisConfig 中 `withStatisticsCollector`

### 场景 9：房源预订超卖 / 锁不生效

**排查路径：**
1. 检查 `RedissonClient` Bean → `RedissonConfig.java` 是否正确创建、连接参数一致
2. 检查锁 key → 必须为 `lock:house:{id}`（所有预订请求竞争同一把锁）
3. 检查 tryLock 参数 → 等待 5 秒、租约 10 秒（若业务执行 > 10 秒锁会自动过期，需调大租约）
4. 检查是否通过 `self.doBookHouse(id)` 代理调用 → `@Transactional` 必须走代理才生效
5. 检查锁释放时机 → 必须在事务提交**之后**释放（非事务方法加锁 + finally 中 `isHeldByCurrentThread` 判断）
6. 检查 double-check → 锁内是否重新查询 `booked` 字段最新状态

---

## 七、快速启动命令

```bash
# 前置依赖：本地启动 Redis（缓存 + 分布式锁）
redis-server  # 默认 localhost:6379，可用 REDIS_HOST / REDIS_PORT 环境变量覆盖

# 开发环境启动
cd backend
mvn spring-boot:run  # 后端（端口 8080）

cd frontend
npm install
npm run dev  # 前端（端口 3000）

# 生产环境启动（Docker）
docker-compose up -d --build  # 一键启动所有服务
docker-compose ps  # 查看服务状态
docker-compose logs -f  # 查看日志
```

---

**文档版本：** v1.5  
**最后更新：** 2026-08-08  
**维护者：** 系统架构组  

**v1.5 更新说明（Redis 集成）：**
- 更新技术栈说明，新增 Redis（Spring Data Redis + Redisson）
- 新增 Redis 基础设施文件：`RedisConfig`（RedisTemplate + RedisCacheManager + 缓存统计）、`RedisService`、`RedissonConfig`、`CacheMetricsController`
- 更新房源模块：详情缓存（`getById`/`getByIdCached` + 缓存穿透保护 + 手动刷新接口）、预订接口（分布式锁防超卖）、`House.booked` 字段
- 前端接入：详情页新增"立即预订"按钮（`bookHouse`，已预订禁用 + 标签提示）与"刷新缓存"按钮（`refreshHouseCache`）
- 新增业务功能映射：房源详情缓存、缓存穿透保护、手动刷新缓存、缓存一致性、房源预订、缓存监控
- 新增排障场景 7-9：Redis 连接失败、缓存命中率低、预订超卖
- 更新配置文件速查表与快速启动命令（Redis 前置依赖）

**v1.4 更新说明：**
- 更新 `api/adminUser.js` 说明，添加房东审核功能（reviewLandlord API）
- 更新 `router/index.js` 说明，添加权限校验和调试日志
- 更新 `stores/user.js` 说明，添加角色格式统一处理（去除 ROLE_ 前缀）
- 更新"用户管理"业务功能映射，添加房东审核排查点

**v1.3 更新说明：**
- 新增 `common/controller/FileController.java` 文件上传控制器
- 新增 `common/service/FileService.java` 文件服务
- 更新 `common/config/WebMvcConfig.java` 说明（新增静态资源映射）
- 新增 `api/upload.js` 前端文件上传 API
- 新增"文件上传服务"业务功能映射条目
- 更新实体类字段说明：`SysUser.avatar`、`House.images`、`Repair.attachments`、`Contract.attachments`
