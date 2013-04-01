/* ===========================================================
 * bootstrap-tooltip.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      if (this.options.trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (this.options.trigger != 'manual') {
        eventIn = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
        eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data())

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) return self.show()

      clearTimeout(this.timeout)
      self.hoverState = 'in'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip
        , inside
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp

      if (this.hasContent() && this.enabled) {
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        inside = /in/.test(placement)

        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block' })
          .insertAfter(this.$element)

        pos = this.getPosition(inside)

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (inside ? placement.split(' ')[1] : placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        $tip
          .offset(tp)
          .addClass(placement)
          .addClass('in')
      }
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.detach()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.detach()

      return this
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function (inside) {
      return $.extend({}, (inside ? {top: 0, left: 0} : this.$element.offset()), {
        width: this.$element[0].offsetWidth
      , height: this.$element[0].offsetHeight
      })
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)
      self[self.tip().hasClass('in') ? 'hide' : 'show']()
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tooltip

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover'
  , title: ''
  , delay: 0
  , html: false
  }


 /* TOOLTIP NO CONFLICT
  * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);

/* AddThis config */
var addthis_config = {
	"data_track_addressbar": true
};

/* (c) 2008-2012 AddThis, Inc */
var addthis_conf={ver:300};if(!((window._atc||{}).ver)){var _atd="www.addthis.com/",_atr="//s7.addthis.com/",_atrc="//c.copyth.is/",_euc=encodeURIComponent,_duc=decodeURIComponent,_atc={dbg:0,rrev:118580,dr:0,ver:250,loc:0,enote:"",cwait:500,bamp:0.25,camp:1,csmp:0.0001,damp:0,famp:0.02,pamp:0.2,tamp:1,lamp:1,plmp:0.00001,vamp:1,vrmp:0,ohmp:0,ltj:1,xamp:1,abf:!!window.addthis_do_ab,qs:0,cdn:0,rsrcs:{bookmark:_atr+"static/r07/bookmark031.html",atimg:_atr+"static/r07/atimg031.html",countercss:_atr+"static/r07/counter007.css",counterIE67css:_atr+"static/r07/counterIE67003.css",counter:_atr+"static/r07/counter009.js",core:_atr+"static/r07/core053.js",wombat:_atr+"static/r07/bar017.js",wombatcss:_atr+"static/r07/bar006.css",qbarcss:_atr+"bannerQuirks.css",fltcss:_atr+"static/r07/floating007.css",barcss:_atr+"static/r07/banner004.css",barjs:_atr+"static/r07/banner003.js",contentcss:_atr+"static/r07/content005C.css",contentjs:_atr+"static/r07/content007.js",copythis:_atrc+"static/r07/copythis00C.js",copythiscss:_atrc+"static/r07/copythis00C.css",ssojs:_atr+"static/r07/ssi004.js",ssocss:_atr+"static/r07/ssi004.css",authjs:_atr+"static/r07/auth009.js",peekaboocss:_atr+"static/r07/peekaboo002.css",overlayjs:_atr+"static/r07/overlay005.js",widget32css:_atr+"static/r07/widgetbig050.css",widget20css:_atr+"static/r07/widgetmed001.css",widgetcss:_atr+"static/r07/widget100.css",widgetIE67css:_atr+"static/r07/widgetIE67005.css",widgetpng:"//s7.addthis.com/static/r07/widget050.gif",embed:_atr+"static/r07/embed005.js",embedcss:_atr+"static/r07/embed000.css",link:_atr+"static/r07/link005.html",pinit:_atr+"static/r07/pinit010.html",linkedin:_atr+"static/r07/linkedin020.html",fbshare:_atr+"static/r07/fbshare002.html",tweet:_atr+"static/r07/tweet025.html",menujs:_atr+"static/r07/menu134.js",sh:_atr+"static/r07/sh105.html"}};}(function(){var g;var p=(window.location.protocol=="https:"),D,m,z=(navigator.userAgent||"unk").toLowerCase(),v=(/firefox/.test(z)),o=(/msie/.test(z)&&!(/opera/.test(z))),c={0:_atr,1:"//ct1.addthis.com/",2:"//ct2.addthis.com/",3:"//ct3.addthis.com/",4:"//ct4.addthis.com/",5:"//ct5.addthis.com/",100:"//ct0.addthis.com/"},C={au:"1",hk:"1",is:"1",id:"1",jp:"1",my:"1",ph:"1",sg:"1",kr:"1",ch:"1",tw:"1",th:"1",tr:"1",ru:"1",vn:"1"},E={de:"1",es:"1"},j={no:"1",pl:"1"},f={be:"1",ca:"1",fr:"1",mx:"1",nl:"1",no:"1",pl:"1",gb:"1",us:"1"},n={at:"1",cz:"1",dk:"1",fi:"1",gr:"1",hu:"1",it:"1",pt:"1",ro:"1",se:"1",ua:"1"};_atc.cdn=0;if(!window.addthis||window.addthis.nodeType!==g){try{D=window.navigator?(navigator.userLanguage||navigator.language):"";m=D.split("-").pop().toLowerCase();if(m.length!=2){m="unk";}if(p||_atr.indexOf("-")>-1){}else{if(window.addthis_cdn!==g){_atc.cdn=window.addthis_cdn;}else{if(C[m]){_atc.cdn=5;}else{if(f[m]){_atc.cdn=(v||o)?5:1;}else{if(E[m]){_atc.cdn=(o||(/chrome/.test(z)))?5:1;}else{if(j[m]){_atc.cdn=v?5:1;}else{if(n[m]){_atc.cdn=(o)?5:1;}}}}}}}if(_atc.cdn){for(var y in _atc.rsrcs){if(_atc.rsrcs.hasOwnProperty(y)){_atc.rsrcs[y]=_atc.rsrcs[y].replace(_atr,typeof(window.addthis_cdn)==="string"?window.addthis_cdn:c[_atc.cdn]).replace(/live\/([a-z])07/,"live/$107");}}_atr=c[_atc.cdn];}}catch(A){}function b(r,k,e,a){return function(){if(!this.qs){this.qs=0;}_atc.qs++;if(!((this.qs++>0&&a)||_atc.qs>1000)&&window.addthis){window.addthis.plo.push({call:r,args:arguments,ns:k,ctx:e});}};}function x(k){var e=this,a=this.queue=[];this.name=k;this.call=function(){a.push(arguments);};this.call.queuer=this;this.flush=function(F,s){this.flushed=1;for(var r=0;r<a.length;r++){F.apply(s||e,a[r]);}return F;};}window.addthis={ost:0,cache:{},plo:[],links:[],ems:[],timer:{load:((new Date()).getTime())},_Queuer:x,_queueFor:b,data:{getShareCount:b("getShareCount","data")},bar:{show:b("show","bar"),initialize:b("initialize","bar")},login:{initialize:b("initialize","login"),connect:b("connect","login")},configure:function(r){if(!w.addthis_config){w.addthis_config={};}if(!w.addthis_share){w.addthis_share={};}for(var a in r){if(a=="share"&&typeof(r[a])=="object"){for(var e in r[a]){if(r[a].hasOwnProperty(e)){if(!addthis.ost){w.addthis_share[e]=r[a][e];}else{addthis.update("share",e,r[a][e]);}}}}else{if(r.hasOwnProperty(a)){if(!addthis.ost){w.addthis_config[a]=r[a];}else{addthis.update("config",a,r[a]);}}}}},box:b("box"),button:b("button"),counter:b("counter"),count:b("count"),toolbox:b("toolbox"),update:b("update"),init:b("init"),ad:{menu:b("menu","ad","ad"),event:b("event","ad"),getPixels:b("getPixels","ad")},util:{getServiceName:b("getServiceName")},ready:b("ready"),addEventListener:b("addEventListener","ed","ed"),removeEventListener:b("removeEventListener","ed","ed"),user:{getID:b("getID","user"),getGeolocation:b("getGeolocation","user",null,true),getPreferredServices:b("getPreferredServices","user",null,true),getServiceShareHistory:b("getServiceShareHistory","user",null,true),ready:b("ready","user"),isReturning:b("isReturning","user"),isOptedOut:b("isOptedOut","user"),isUserOf:b("isUserOf","user"),hasInterest:b("hasInterest","user"),isLocatedIn:b("isLocatedIn","user"),interests:b("getInterests","user"),services:b("getServices","user"),location:b("getLocation","user")},session:{source:b("getSource","session"),isSocial:b("isSocial","session"),isSearch:b("isSearch","session")},_pmh:new x("pmh")};var t=document.getElementsByTagName("script")[0];function d(a){a.style.width=a.style.height="1px";a.style.position="absolute";a.style.zIndex=100000;}if(document.location.href.indexOf(_atr)==-1){var q=document.getElementById("_atssh");if(!q){q=document.createElement("div");q.style.visibility="hidden";q.id="_atssh";d(q);t.parentNode.appendChild(q);}function h(a){if(a&&!(a.data||{})["addthisxf"]){if(addthis._pmh.flushed){_ate.pmh(a);}else{addthis._pmh.call(a);}}}if(window.postMessage){if(window.attachEvent){window.attachEvent("onmessage",h);}else{if(window.addEventListener){window.addEventListener("message",h,false);}}}if(!q.firstChild){var i,z=navigator.userAgent.toLowerCase(),u=Math.floor(Math.random()*1000);i=document.createElement("iframe");i.id="_atssh"+u;i.title="AddThis utility frame";q.appendChild(i);d(i);i.frameborder=i.style.border=0;i.style.top=i.style.left=0;_atc._atf=i;}}var B=document.createElement("script");B.type="text/javascript";B.src=(p?"https:":"http:")+_atc.rsrcs.core;t.parentNode.appendChild(B);var l=10000;setTimeout(function(){if(!window.addthis.timer.core){if(Math.random()<_atc.ohmp){(new Image()).src="//m.addthisedge.com/live/t00/oh.gif?"+Math.floor(Math.random()*4294967295).toString(36)+"&cdn="+_atc.cdn+"&sr="+_atc.ohmp+"&rev="+_atc.rrev+"&to="+l;}if(_atc.cdn!==0){var e=document.createElement("script");e.type="text/javascript";e.src=(p?"https:":"http:")+_atr+"static/r07/core053.js";t.parentNode.appendChild(e);}}},l);}})();

(function() { // store vars in a privately scoped anonymous function

    /* load global objects */

    var privacyMode = false,
        api_access_token = null,
        api_url = null,
        currentQuestion = null,
        $body = null,
        $askInputs = null,
        $askAgainForm = null,
        $askAgainInput = null,
        $askAgainButton = null,
        $questionDisplay = null,
        $inputError = null,
        $eightballAnswerContainer = null,
        $privacyToggle = null,
        $privacyToggleTooltip = null,
        answerList = [ // load list of possible answers as an array
            ['As I see it, yes.', 'As&nbsp;&nbsp;I<br>see it<br>yes'],
            ['It is certain.', 'It is<br>certain'],
            ['It is decidedly so.', 'It is<br>decidedly<br>so', 'peak'],
            ['Most likely.', 'Most<br>likely', 'peak'],
            ['Outlook good.', 'Outlook<br>good'],
            ['Signs point to yes.', 'Signs<br>point to<br>yes'],
            ['Without a doubt.', 'Without<br>a<br>doubt'],
            ['Yes.', '<br>Yes'],
            ['Yes, definitely.', 'Yes<br>definitely', 'peak'],
            ['You may rely on it.', 'You<br>may rely<br>on&nbsp;&nbsp;it', 'peak'],
            ['Ask again later.', 'Ask<br>again<br>later', 'peak'],
            ['Better not tell you now.', 'Better<br>not tell<br>you now', 'peak'],
            ['Cannot predict now.', 'Cannot<br>predict<br>now'],
            ['Concentrate and ask again.', 'Concentrate<br>and ask<br>again'],
            ['Reply hazy, try again.', 'Reply hazy<br>try<br>again'],
            ['Don\'t count on it.', 'Don&rsquo;t<br>count<br>on&nbsp;&nbsp;it', 'peak'],
            ['My reply is no.', 'My reply<br>is<br>no'],
            ['My sources say no.', 'My<br>sources<br>say<br>no'],
            ['Outlook not so good.', 'Outlook<br>not so<br>good'],
            ['Very doubtful.', 'Very<br>doubtful', 'peak']
        ];

    /* /load global objects */

    /* random function */

    function rando(itemCount, minNum) {

        if (minNum === undefined) minNum = 0;

        return Math.floor( ( Math.random() * itemCount ) + minNum );

    }

    /* /random function */

    /* shuffle array helper function */

    Array.prototype.shuffle = function() {

        var s = [];

		while (this.length) s.push(this.splice(Math.random() * this.length, 1)[0]);

		while (s.length) this.push(s.pop());

		return this;

    };

    /* shuffle array helper function */

    /* save a note to bitly */

    function bittle(answer, successCallback) { // returns an optional callback upon success

        if (!privacyMode) { // only log questions/answers to bitly/twitter if Privacy Mode is disabled (default)

            var bittleURL = 'http://8ball.beautifuluniquesnowflake.com/?' + new Date().getTime(), // create bittle URL with rando query string
                note = 'Q: ' + currentQuestion + '\nA: ' + answer + '\n#magic8ball';

            // make sure api url and access token are set before attempting to save note
            if ( !api_access_token || !api_url ) {
                console.log('not yet initialized');
                return;
            }

            // make sure that the required parameters are included
            if ( !bittleURL || !note ) {
                throw 'Attempt to post note without a bittleURL or a note';
            }

            // call to bitly
            $.ajax({
                url: api_url + '/v3/user/link_save?access_token=' + api_access_token + '&longUrl=' + encodeURIComponent(bittleURL) + '&note=' + encodeURIComponent( note ),
                dataType: 'json',
                success: successCallback
            });

        }

    }

    /* /save a note to bitly */

    /* show random placeholder question */

    function showPlaceholderQuestion() {

        var count = 0,
            placeholderList = [ // load list of placeholder questions as an array
            'Should I dye my hair',
            'Do these pants make me look fat',
            'Should I join the Army',
            'Do narwhals bacon at midnight',
            'Does might really make right',
            'Should I change jobs',
            'Should I change careers',
            'Should I get a sex change',
            'Should I get a dog',
            'Should I get a cat',
            'Should I buy a boat',
            'Should I grow my hair out',
            'Should I run for president',
            'Will I die young',
			'Am I too old to die young',
			'Is there life after death'
        ].shuffle();

        function loop() {

            if (count === placeholderList.length) count = 0; // if count equals the number of dummy questions, reset it to 0

            $askInputs.addClass('placeholder-question placeholder-question-swap'); // add swap class to fade placeholder text color to transparent, and add original placeholder class just in case this is the first time

            var timer1 = setTimeout(function() {

                $askInputs.attr('placeholder', placeholderList[count]).removeClass('placeholder-question-swap'); // add the current dummy question and then remove the swap class to fade color back visible

                count++; // increment the counter

                clearTimeout(timer1); // clear the timeout to prevent memory leaks

            }, 750); // delay the function by 750ms

            var timer2 = setTimeout(loop, 7000); // switch the question every 7 seconds

        }

        loop();

    }

    /* /show random placeholder question */

    /* input error alerts */

    function inputError(errorType, currentInput) {

        var errorMsg = null;

        switch (errorType) {

            case 'dupeQuestion':
            errorMsg = '<label class="input-error dupe-question show-hide" for="askAgainInput">Please rephrase your question<br>before asking again</label>';
            break;

            case 'nullQuestion':
            errorMsg = '<label class="input-error null-question show-hide">You must ask The Oracle a question</label>';
            break;

            default:
            return;

        }

        $inputError.html(errorMsg);

        $(currentInput).find('.ask-input').addClass('error').one('keydown', function(e) { // add "error" class to current input element, then attach a single-firing event to remove the class as soon as any key is pressed
            if (e.which !== 13) {
                $(this).removeClass('error');
            }
        });

    }

    /* /input error alerts */

    /* toggle privacy mode */

    function togglePrivacyMode() {

        $privacyToggle.change(function() {
            if ( $(this).prop('checked') ) {
                privacyMode = false;
            } else {
                privacyMode = true;
            }
        });

        $privacyToggleTooltip.tooltip(); // initialize privacy mode tooltip

    }

    /* toggle privacy mode */

    /* keyboard shortcuts / special bindings */

    function loadKeyboardShortcuts() {
        $askAgainInput.keydown(function(e) { // if the user presses "return" within the ask again input textarea trigger sumbit on the ask again form
            if (e.which == 13) {
                e.preventDefault();
                $askAgainForm.submit();
            }
        });
    }

    /* /keyboard shortcuts / special bindings */

    /* load first answer actions */

    function firstAsk() {

        $body.addClass('exit-right enter-left'); // add/remove context classes to/from body element

        $questionDisplay.text(currentQuestion); // display the current question in the question display area

        $askAgainInput.val(currentQuestion.split('?')[0]); // display the current question in the ask again input

        loadAnswer();

        // delay before focus on input
        var t = setTimeout( function(){
            $askAgainInput.focus().select(); // add context classes to/from body element
            clearTimeout(t);
        }, 8000);

    }

    /* /load first answer actions */

    /* reload 8ball / ask again actions */

    function askAgain() {

        $body.removeClass('enter-left ask-again ask-again-fixed').addClass('ask-again'); // add/remove context classes to/from body element

        $questionDisplay.text(currentQuestion); // display the current question in the question display area

        $askAgainInput.add($askAgainButton).attr('disabled', 'disabled'); // display the current question in the ask again input (ensures the question mark is shown). then set the input to disabled.

        // delay between shake out and skake in to show new answer
        var timer1 = setTimeout( function(){
            loadAnswer();
            clearTimeout(timer1);
        }, 2000);

        // delay before focus on input
        var timer2 = setTimeout( function(){
            $askAgainInput.removeAttr('disabled').focus().select(); // remove disabled state from input and give it focus
            $body.addClass('ask-again-fixed').removeClass('ask-again'); // remove context class from body element
            clearTimeout(timer2);
        }, 5500);

    }

    /* /reload 8ball / ask again actions */

    /* load answer */

    function loadAnswer() {

        /* reset answer triangle orientation */

        $eightballAnswerContainer.removeClass('peak');

        /* /reset answer triangle orientation */

        /* grab fresh random answer */

        var randomAnswer = answerList.shuffle()[0];

        /* insert the random answer and orientation into the page */

        $eightballAnswerContainer.addClass(randomAnswer[2]).children('#eightballAnswerText').html(randomAnswer[1]);

        /* /insert the random answer and orientation into the page */

        /* rotate answer triangle randomly between -15 - 15 deg */

        function transform (element, value) {
            element.style.webkitTransform = value;
            element.style.MozTransform = value;
            element.style.msTransform = value;
            element.style.OTransform = value;
            element.style.transform = value;
        }

        transform(document.getElementById('eightballAnswerContainer'), 'rotate(' + ( rando(30, 1) - 15) + 'deg)');

        /* /load random answer triangle rotation between -15 - 15 deg */

        /* send a bittle of this encounter */

        bittle(randomAnswer[0]);

        /* /send a bittle of this encounter */

    }

    /* /load answer */

    /* grab api credentials */

    $.ajax({
        url: 'assets/js/plugins/jelly.js',
        data: {},
        type: 'POST',
        dataType:'json',
        success: function(data, textStatus) {
            api_access_token = data.api_access_token;
            api_url = data.api_url;
        }
    });

    /* /grab api credentials */

    /* when DOM is ready, bind some shit */

    $(document).ready(function() {

        // cache a couple objects as vars to save on the repeated selector lookup
        $body = $('body'),
        $askInputs = $('.form-search .ask-input'),
        $askAgainForm = $('#askAgainForm'),
        $askAgainInput = $askAgainForm.find('.ask-input'),
        $askAgainButton = $askAgainForm.find('.ask-button'),
        $questionDisplay = $('#questionDisplay'),
        $inputError = $('#inputError > div'),
        $eightballAnswerContainer = $('#eightballAnswerContainer'),
        $privacyToggle = $('#privacyToggle'),
        $privacyToggleTooltip = $('#privacyToggleTooltip');

        loadKeyboardShortcuts(); // load keyboard shortcuts / special key bindings

        togglePrivacyMode(); // load privacy mode handlers

        showPlaceholderQuestion(); // load random placeholder question

        $('#askForm, #askAgainForm').submit( function (e) {

            e.preventDefault();

            if ($(this).find('.ask-input').val().length === 0) { // perform simple validation that question is not blank
                inputError('nullQuestion', this);
            } else if ($(this).find('.ask-input').val().split('?')[0] + '?' === currentQuestion) { // make sure the question is different than the previous question
                inputError('dupeQuestion', this);
            } else {
                currentQuestion = $(this).find('.ask-input').val().replace(/\?$/, '').replace(/\s$/, '') + '?'; // set the current question var with the asked question. remove any trailing question marks in case the user added one, then add a question mark in case the user didn't

                $(inputError).find('.input-error').removeClass('show-hide'); // hide error msg if shown

                if ( $body.hasClass('exit-right') ) { // if we're asking a repeat question load the ask again function (the idea being that the exit-right class is added after first load and never removed)
                    askAgain();
                } else { // else load the first time function
                    firstAsk();
                }

            }
        });

    });

    /* /when DOM is ready, bind some shit */

})();