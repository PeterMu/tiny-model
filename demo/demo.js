/**
 * 使用样例
 * 在编写使用样例时会把所有配置参数写上，有些参数有默认值
 * 如果默认值符合需求，可以不写
 */
requirejs.config({
    barUrl: './',
    paths: {
        'jquery': 'libs/jquery'
    }
})

requirejs(['jquery', '../dist/model'], function($, Model){
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
         * 防xsrf参数，默认为 _xsrf
         * 即：参数名为_xsrf, cookie 的名称也是 _xsrf
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
         * 具体的 dao 配置对象，key 为 dao 的方法名称，value 为 dao 方法的具体配置
         * dao 方法配置的必须字段：
         * url： cgi 地址
         * method http 请求的方法
         * 重要提示：全局默认配置都会应用到dao方法，如果全局配置不满足某个dao方法的需求
         * 可以在dao方法的配置中重新配置，dao 方法的配置优先级最高
         */
        modelConfig: {
            getDomain: {
                url: '/Domain.List',
                method: 'GET',
                /**
                 * 在解析响应数据时，获取状态码的字段名称为 status
                 * 不会是全局默认的配置的 status.code，因为此dao方法配置了 codeKey 为 status
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
     * Model 初始化时会根据 daoConfig 对象生成 dao 方法
     * dao 方法的方法名为 daoConfig 配置对象的 key
     * 生成的 dao 方法，参数列表如下：
     * (params, successCb, [errorCb])
     */
    var model = new Model(config)
    model.getDomain({
        domain_id: 1001
    }, function(resp, isSucc, status){
        console.log(resp)
    }, function(error){
        console.log(error)
    })

    model.addDomain({
        domain: 'dnspod.cn'
    }, function(resp, isSucc, status){
        console.log(resp)
    })
})
