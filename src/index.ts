const express = require('express'); // 引入 Express 框架
const {Cluster} = require('puppeteer-cluster'); // 引入 Puppeteer Cluster 库，用于并发浏览器任务
const MarkdownIt = require('markdown-it'); // 引入 Markdown-It 库，用于解析 Markdown 语法
const md = new MarkdownIt({breaks: false}); // 初始化 Markdown-It，并设置换行符解析选项
const {LRUCache} = require('lru-cache'); // 引入 LRU 缓存库，并注意其导入方式
const port = 3000; // 设置服务器监听端口
const url = 'https://fireflycard.shushiai.com/'; // 要访问的目标 URL
// const url = 'http://localhost:3000/'; // 要访问的目标 URL
const scale = 2; // 设置截图的缩放比例，图片不清晰就加大这个数值
const maxRetries = 3; // 设置请求重试次数
const maxConcurrency = 10; // 设置 Puppeteer 集群的最大并发数
const app = express(); // 创建 Express 应用
app.use(express.json()); // 使用 JSON 中间件
app.use(express.urlencoded({extended: false})); // 使用 URL 编码中间件

let cluster; // 定义 Puppeteer 集群变量

// 设置 LRU 缓存，最大缓存项数和最大内存限制
const cache = new LRUCache({
    max: 100, // 缓存最大项数，可以根据需要调整
    maxSize: 50 * 1024 * 1024, // 最大缓存大小 50MB
    sizeCalculation: (value, key) => {
        return value.length; // 缓存项大小计算方法
    },
    ttl: 600 * 1000, // 缓存项 10 分钟后过期
    allowStale: false, // 不允许使用过期的缓存项
    updateAgeOnGet: true, // 获取缓存项时更新其年龄
});

// 初始化 Puppeteer 集群
async function initCluster() {
}

// 生成请求唯一标识符
function generateCacheKey(body) {
    return JSON.stringify(body); // 将请求体序列化为字符串
}

// 处理请求的主要逻辑
async function processRequest(req) {
}
app.post('/', async (req, res) => {
      res.status(200).send(`处理请求失败，已重试 ${maxRetries} 次`); // 发送错误响应
})

// 处理保存图片的 POST 请求
app.post('/saveImg', async (req, res) => {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const buffer = await processRequest(req); // 处理请求
            res.setHeader('Content-Type', 'image/png'); // 设置响应头
            res.status(200).send(buffer); // 发送响应
            return;
        } catch (error) {
            console.error(`第 ${attempts + 1} 次尝试失败:`, error);
            attempts++;
            if (attempts >= maxRetries) {
                res.status(500).send(`处理请求失败，已重试 ${maxRetries} 次`); // 发送错误响应
            } else {
                await delay(1000); // 等待一秒后重试
            }
        }
    }
});

// 处理进程终止信号
process.on('SIGINT', async () => {
    await cluster.idle(); // 等待所有任务完成
    await cluster.close(); // 关闭 Puppeteer 集群
    process.exit(); // 退出进程
});

// 启动服务器并初始化 Puppeteer 集群
app.listen(port, async () => {
    console.log(`监听端口 ${port}...`);
    await initCluster();
});

// 延迟函数，用于等待指定的毫秒数
function delay(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
export default app;