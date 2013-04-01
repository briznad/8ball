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