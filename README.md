# Tiny-Model   [![npm](https://img.shields.io/npm/v/tiny-model.svg)](https://www.npmjs.com/package/tiny-model)  [![npm](https://img.shields.io/npm/dt/tiny-model.svg)](https://www.npmjs.com/package/tiny-model)

根据请求配置文件生成超轻量级 model，可以根据项目需求，基于 tiny-model 封装出model组件。


## 配置参数

### sendType { String }

必须，默认为form，可选值为：form，json

### dataType { String }

必须，默认为json，配置响应数据的类型

### xsrf { String / Function }

可选，防 csrf/xsrf 的 token 配置。配置后，发送请求时会自动在cookie中获取对应的token，放到请求参数里。

当 xsrf 为 Function 时，需要返回的数据结构为：

```
{
    //xsrf 的参数名
    name: '_xsrf',
    value: 'xxx'
}
```

### showMask { Boolean }

可选，默认为flase，发送请求时是否显示遮罩

### maskClass { String }

可选，遮罩的样式，仅当showMask为true时会生效

### disableEl { Object }

可选，发送请求时要disabled的dom对象

### disableClass { String }

可选，disable 时要应用的样式名称，仅当 disableEl 有效时才会生效

### hasToken { Boolean }

必须，默认为true，发送请求时自动添加时间戳，防止缓存。

### baseUrl { String }

必须，请求的根路径，默认为空

### codeKey { String }

必须，默认为 status.code，返回数据中状态码的key，如果没有状态码配置为null

### msgKey { String }

必须，默认为 status.message，返回数据中状态信息的key，如果没有状态信息配置为null

### successCode { String/Number }

成功的状态码，codeKey 不为 null 时的必须配置，默认值为：1。

### before { Function }

可选，每次请求之前要执行的函数，回调的参数为 (resp, isSucc, config)

### complete { Function }

可选，每次请求完成后要执行的函数，回调的参数为 (resp, isSucc, config)

### error { Function }

可选，每次请求报错后（非200的响应）要执行的函数，回调的参数为 (error, config)

## headers { Object }

可选，自定义请求头

### xhrFields { Object }

可选，设置XHR 对象的属性，例如跨域请求时要求携带cookie的设置：

```
xhrFields: {
    withCredentials: true
}
```

### modelConfig { Object }

model 请求方法配置对象。上面的全局配置项都可以在 modelConfig 中配置，modelConfig 会覆盖全局配置项， 必选参数如下：

#### url { String }

请求的url

#### method { String }

请求的方法

#### 举个栗子

```
//配置信息
modelConfig: {
    test: {
        url: '/test',
        method: 'get'
    }
}

//生成的 model 方法
model.test(data, successCb, errorCb) //callback style

model.done(successCb).fail(errorCb) //promise style

//successCb
//resp: 请求响应
//isSucc: 是否成功，根据 codeKey 和 successCode 的配置判断
//status: 状态信息，status.code 对应 codeKey 配置，status.msg 对应 msgKey 配置
successCb (resp, isSucc, status)

//errorCb
//error: error.status http 状态码，error.textStatus 状态信息（如：error, timeout ...）
errorCb (error)
```

## 使用样例

```
var Model = require('tiny-model')
//Model 配置
var config = {
    before: function(){
        console.log('before')
    },
    complete: function(){
        console.log('complete')
    },
    error: function(){
        console.log('error')
    },
    /**
     * 请求地址的根路径，baseUrl+daoConfig.url 为最终请求地址
     * baseUrl 默认是空
     */
    baseUrl: '/Api',

    /**
     * 发送的数据类型：json 或 form
     * 如果是 json 那么发送的数据就是个json字符串，如果是form就是普通的form提交
     * sendType 默认是 json
     */
    sendType: 'form',

    /**
     * 响应数据类型，默认为 json
     */
    dataType: 'json',

    /**
     * 防xsrf参数，默认为null
     * 如果配置为_xsrf，那么携带的参数名为_xsrf, cookie 的名称也是 _xsrf
     */
    xsrf: null,

    /**
     * 是否显示遮罩，默认为 false
     */
    showMask: false,

    /**
     * showMask 为 true 时，遮罩div的样式
     */
    maskClass: 'mask',

    /**
     * 发送请求时，要disable的dom，配置jquery选择器即可
     */
    disableEl: null,

    /**
     * disableEl 不是 null 的时候，要给 disableEl 添加的样式
     * 默认为 disabled
     */
    disableClass: 'disabled',

    /**
     * 是否添加基于时间戳的防缓存token
     * 默认是true
     */
    hasToken: true,

    /**
     * 状态码字段名称
     * 默认为 status.code
     */
    codeKey: 'status.code',

    /**
     * 成功的状态码
     * 默认是 1
     */
    successCode: 1,

    /**
     * 状态信息字段名称
     * 默认为 status.message
     */
    msgKey: 'status.message',

    /**
     * 自定义 ajax 请求头
     */
    xhrFields: null,

    /**
     * 具体的 model 配置对象，key 为 model 的方法名称，value 为 model 方法的具体配置
     * dao 方法配置的必须字段：
     * url： api 地址
     * method http 请求的方法
     * 重要提示：全局默认配置都会应用到 model 方法，如果全局配置不满足某个 model 方法的需求
     * 可以在 model 方法的配置中重新配置，model 方法的配置优先级最高
     */
    modelConfig: {
        getDomain: {
            url: '/Domain.List',
            method: 'GET',
            /**
             * 在解析响应数据时，获取状态码的字段名称为 status
             * 不会是全局默认的配置的 status.code，因为此 model 方法配置了 codeKey 为 status
             */
            codeKey: 'status',
            msgKey: 'string'
        },
        addDomain: {
            url: '/Domain.Add',
            method: 'POST',
            hasToken: false
        }
    }
}

/**
 * Model 初始化时会根据 modelConfig 对象生成 model 方法
 * model 方法的方法名为 modelConfig 配置对象的 key
 * 生成的 model 方法，参数: (params, successCb, [errorCb])
 * 参数说明：
 * params: 请求的参数
 * successCb: 请求成功（HTTP 200）的回调函数
 * errorCb: 请求失败（HTTP 非200）的回调函数
 */
var model = new Model(config)
model.getDomain({
    domain_id: 1001
}, function(resp, isSucc){
    console.log(resp)
}, function(error){
    console.log(error)
})

model.addDomain({
    domain: 'dnspod.cn'
}, function(resp, isSucc){
    console.log(resp)
})
```

## Recent Release

### v0.1.3

- 生成的 model 方法返回 jquery deferred 对象，支持 .done .fail .then 用法。
- 修正 model 模块定义写法。

### v0.1.2

- 生成的 model 方法，返回 jqXHR，可以使用 deferred
- 添加 headers 配置项
- 修正 xhrFields 配置的说明

