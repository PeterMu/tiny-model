/**
 * 公用数据请求组件
 * @author petermu
 */
 !function(factory){
    // amd
    if (typeof define == 'function' && define.amd) {
        define(['jquery'], function($) {
            return factory($)
        })
    //cmd
    } else if (typeof define == 'function' && define.cmd) {
        define(function(require, exports, module) {
            var $ = require('jquery')
            return factory($)
        })
    } else {
        if (window.jQuery) {
            var ret = factory(window.jQuery)
            window.Model = ret
        } else {
            console && console.error('U need to load jquery!')
        }
    }
}(function(jQuery){
    var $ = jQuery
    var Model = function(config){
        this._config = config || {}
        this._config = $.extend(true, {
            before: null,
            complete: null,
            error: null,
            sendType: 'form',
            dataType: 'json',
            xsrf: null,
            showMask: false,
            maskClass: 'mask',
            disableEl: null,
            disableClass: 'disabled',
            hasToken: true,
            baseUrl: '',
            codeKey: 'status.code',
            msgKey: 'status.message',
            successCode: 1,
            xhrFields: null,
            headers: {}
        }, this._config)
        this.init()
    }

    /**
     * 根据配置初始化Model实例
     */
    Model.prototype.init = function(){
        var ModelConfig = this._config.modelConfig
        if(ModelConfig){
            for(var key in ModelConfig){
                this[key] = this.buildReq(ModelConfig[key])
            }
        }
    }

    /**
     * 根据ModelConfig配置构造请求方法
     * @param  {Object} ModelConfig 请求配置
     * @return {Function} 请求方法
     */
    Model.prototype.buildReq = function(ModelConfig){
        var sendType = this.getConfig('sendType', ModelConfig.sendType),
            dataType = this.getConfig('dataType', ModelConfig.dataType),
            that = this;
        return function(params, successCb, errorCb){
            var startTime = new Date().getTime(), url = ''
            if(typeof params == 'function'){
                successCb = params
                errorCb = successCb
                params = null
            }
            url = that.parseUrl(ModelConfig.url, params, ModelConfig.hasToken, ModelConfig._xsrf)
            that._beforeProcess(params, ModelConfig)
            params = that.mergeParams(params, ModelConfig.data) 
            return that._send(url,
                params,
                ModelConfig.method || 'GET',
                sendType,
                dataType,
                ModelConfig,
                function(error, data, isSuccess, status){
                    that._afterProcess(error, data, url, startTime, ModelConfig)
                    if(!error){
                        successCb && successCb(data, isSuccess, status)
                    }else{
                        errorCb && errorCb(error, ModelConfig)
                    }
                }
            )
        }
    }

    Model.prototype.mergeParams = function(params, configParams) {
        if (configParams) {
            params = params || {}
            for (var key in configParams) {
                if (!params[key]) {
                    params[key] = configParams[key]
                }
            }
        }
        return params
    }

    /**
     * 根据配置获取相应数据的状态信息
     * @param {String} data 响应数据
     * @param {String} codeKey 状态码key
     * @param {String} msgKey  状态信息的key
     * @return {Object} 状态对象，包含code和msg两个属性
     */
    Model.prototype.getStatus = function(data, codeKey, msgKey){
        var code = null, msg = null
        codeKey = this.getConfig('codeKey', codeKey).split('.')
        msgKey = this.getConfig('msgKey', msgKey).split('.')
        if(codeKey){
            for(var i=0,l=codeKey.length; i<l; i++){
                if(!code){
                    code = data[codeKey[i]]
                }else{
                    code = code[codeKey[i]]
                }
            }
        }
        if(msgKey){
            for(var i=0,l=msgKey.length; i<l; i++){
                if(!msg){
                    msg = data[msgKey[i]]
                }else{
                    msg = msg[msgKey[i]]
                }
            }
        }
        return {
            code: code,
            msg: msg
        }
    }

    /**
     * 请求前的处理
     */
    Model.prototype._beforeProcess = function(params, ModelConfig){
        var showMask = this.getConfig('showMask', ModelConfig.showMask)
        var disableEl = this.getConfig('disableEl', ModelConfig.disableEl)
        var disableClass = this.getConfig('disableClass', ModelConfig.disableClass)
        var before = this.getConfig('before', ModelConfig.before)
        showMask && this._showMask()
        disableEl && $(disableEl).addClass(disableClass)
        before && before(params, ModelConfig)
    }

    /**
     * 请求后的处理
     * @param  {String} error 错误信息,非200的情况
     * @param  {Object} data 请求响应数据
     * @param  {String} url 请求URL
     * @param  {Long} startTime 发起请求的时间戳
     * @param  {Object} ModelConfig Model配置
     * @return void
     */
    Model.prototype._afterProcess = function(error, data, url, startTime, ModelConfig){
        var successCode = null,
            showMask = this.getConfig('showMask', ModelConfig.showMask),
            disableEl = this.getConfig('disableEl', ModelConfig.disableEl),
            disableClass = this.getConfig('disableClass', ModelConfig.disableClass),
            complete = this.getConfig('complete', ModelConfig.complete),
            errorFn = this.getConfig('error', ModelConfig.error)
        if(!error){
            var status = this.getStatus(data, ModelConfig.codeKey, ModelConfig.msgKey)
            successCode = this.getConfig('successCode', ModelConfig.successCode)
            complete && complete(data, status.code == successCode, status, ModelConfig, startTime, error)
        }else{
            //非200错误
           errorFn && errorFn(error, ModelConfig, startTime)
        }
        //关闭遮罩
        if(showMask){
            this._hideMask()
        }
        if(disableEl){
            $(disableEl).removeClass(disableClass)
        }
    }

    /**
     * 显示遮罩,全局只有一个遮罩
     */
    Model.prototype._showMask = function(){
        this.$mask = this.$mask || $('<div id="model-mask"><div class="'+this._config.maskClass+'"></div></div>')
        if($('#model-mask').length === 0){
            $(document.body).append(this.$mask)
        }
        this.$mask.show()
    }

    /**
     * 隐藏遮罩
     */
    Model.prototype._hideMask = function(){
        this.$mask.hide()
    }

    /**
     * 获取和全局配置计算后的配置
     * @param  {String} key 配置项
     * @param  {} value 配置项的值
     * @return {} 计算后的配置项的值
     */
    Model.prototype.getConfig = function(key, value){
        if(value === undefined){
            return this._config[key]
        }else{
            return value
        }
    }

    /**
     * 构造请求Url
     * @param  {String} url 原始请求url
     * @param  {Boolean} hasToken 是否添加时间戳
     * @param  {String || Function} xsrf 防止xsrf的cookie名称
     * @return {String} 构建后的请求url
     */
    Model.prototype.parseUrl = function(url, params, hasToken, xsrf){
        url = url || ''
        params = params || {}
        hasToken = this.getConfig('hasToken', hasToken)
        xsrf = this.getConfig('xsrf', xsrf)
        if (/:(\w+)/.test(url)) {
            url = url.replace(/:(\w+)/g, function(match, key) {
                if (params[key]) {
                    var value = params[key]
                    delete params[key]
                    return value
                } else {
                    console.error('tiny-model: the url', url, 'need param', key)
                    return match
                }
            })
        }
        if(this._config.baseUrl){
            url = this._config.baseUrl + url
        }
        if(hasToken){
            url = this.addQueryParam(url, 't', new Date().getTime())
        }
        if(xsrf){
            if(typeof xsrf == 'function') {
                var xsrfObj = xsrf() || {}
                url = this.addQueryParam(url, xsrfObj.name, xsrfObj.value)
            } else {
                url = this.addQueryParam(url, xsrf, this._getCookie(xsrf))
            }
        }
        return url
    }

    /**
     * 添加查询参数
     * @param  {String} url 原始请求url
     * @param  {String} name 参数名称
     * @param  {value} xsrf 参数值
     * @return {String} 添加参数后的url
     */
    Model.prototype.addQueryParam = function(url, name, value){
        if(url.indexOf('?') != -1){
            url = url + '&' + name + '=' + value
        }else{
            url = url + '?' + name + '=' + value
        }
        return url
    }

    /**
     * 获取cookie
     * @param  {String} name cookie名称
     * @return {String}
     */
    Model.prototype._getCookie = function(name){
        var reg = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)")
        var m = document.cookie.match(reg)
        return !m ? "" : m[1]
    }

    /**
     * 发送请求
     * @param    {String} url 请求地址
     * @param    {String} method 请求方法
     * @param    {String} sendType 请求类型 json 或 form
     * @param    {String} dataType 响应数据类型
     * @param    {ModelConfig} ModelConfig Model配置对象
     * @callback {String} cb 请求成功后的回调函数
     * @return   {Deferred}
     */
    Model.prototype._send = function(url, params, method, sendType, dataType, ModelConfig, cb){
        var deferred = $.Deferred()
        var options = {
            url: url,
            type: method
        }, that = this
        sendType = this.getConfig('sendType', sendType)
        options.dataType = this.getConfig('dataType', dataType)
        if(sendType === 'json' && method.toUpperCase() != 'GET'){
            params = JSON.stringify(params)
            options.contentType = 'application/json; charset=UTF-8'
        }
        options.data = params
        options.error = function(xhr, textStatus){
            var errorInfo = {
                //http status
                status: xhr.status,
                //Possible values ars "timeout", "error", "abort", and "parsererror"
                textStatus: textStatus
            }
            cb(errorInfo, null)
            deferred.reject(errorInfo)
        }
        options.success = function(resp, textStatus){
            var status = that.getStatus(resp, ModelConfig.codeKey, ModelConfig.msgKey)
            var successCode = that.getConfig('successCode', ModelConfig.successCode)
            cb(null, resp, status.code === successCode, status)
            deferred.resolve(resp, status.code === successCode, status)
        }
        options.xhrFields = this.getConfig('xhrFields', ModelConfig.xhrFields)
        options.headers = this.getConfig('headers', ModelConfig.headers)
        $.ajax(options)
        return deferred
    }

    return Model
})

