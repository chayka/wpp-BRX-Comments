(function($, _, Backbone){
    _.declare('brx.CommentsList', $.brx.View, {
        options: {
            order: 'asc',
            perPage: 50,
            initialPage: 'newest',
            shown: 50,
            comments: null,
            postId: 0,
            commentViews: {}
        },
        
        postCreate: function(){
//            this.set('commentViews', {});
            this.set('shown', this.getInt('perPage'));
            this.listenTo(this.get('comments'), 'add', $.proxy(this.onCommentPosted, this));
            this.listenTo(this.get('comments'), 'remove', $.proxy(this.removeCommentView, this));
            this.listenTo(this.get('comments'), 'reset', $.proxy(this.renderComments, this));
//            this.listenTo(this.get('comments'), 'all', $.proxy(this.render, this));
            this.listenTo(Backbone.Events, 'brx.Comments.editComment', $.proxy(this.editComment, this));
            this.listenTo(Backbone.Events, 'brx.Comments.replyToComment', $.proxy(this.replyToComment, this));
            this.listenTo(Backbone.Events, 'brx.CommentEditor.commentUpdated', $.proxy(this.onCommentUpdated, this));
            this.listenTo(Backbone.Events, 'brx.CommentEditor.commentReplied', $.proxy(this.onCommentReplied, this));
            this.listenTo(Backbone.Events, 'brx.CommentEditor.updateCanceled', $.proxy(this.onEditorCanceled, this));
            this.listenTo(Backbone.Events, 'brx.CommentEditor.replyCanceled', $.proxy(this.onReplyCanceled, this));
            this.listenTo(Backbone.Events, 'brx.Comments.refresh', $.proxy(this.refreshComments, this));
            this.render();
//            var editor = new $.brx.CommentEditor({el: this.$('#comment-editor-template').html()});
//            this.set('commentEditForm', editor);
        },
        
        render: function(){
            this.renderComments();
            console.log('render.completed');
        },
                
        refreshComments: function(){
            this.get('comments').fetch({data:{post_id: this.getInt('postId')}});
        },
                
        renderComments: function(offset){
            offset = offset || 0;
//            page = page || this.getInt('page');
//            all = all || false;
            var comments = this.get('comments').models;
            var shown = this.getInt('shown');
//            var offset = Math.max(0, (page-1)*this.getInt('perPage'));
            var prevView = offset?this.getCommentView(comments[comments.length-offset]):null;
            for(var i = comments.length-1-offset, j = offset; j < shown && i >= 0; i--, j++){
                var comment = comments[i];
                var view = this.renderComment(comment);
                if('asc' === this.get('order')){
                    if(prevView){
                        prevView.$el.before(view.el);
                    }else{
                        this.get('commentsBox').append(view.el);
                    }
                }else{
                    if(prevView){
                        prevView.$el.after(view.el);
                        
                    }else{
                        this.get('commentsBox').prepend(view.el);
                    }
                }
                prevView = view;
            }
//            for(var i = comments.length-1-offset, j = offset; j < shown && i >= 0; i--, j++){
//                var comment = comments[i];
//                var view = this.renderComment(comment);
//                if('asc' === this.get('order')){
//                    this.get('commentsBox').prepend(view.el);
//                }else{
//                    this.get('commentsBox').append(view.el);
//                }
//            }
            this.get('views.shown').text(_.template('Показано <%= shown %> из <%= count %>', {
                shown: shown,
                count: comments.length
            }));
            this.get('views.total').text(comments.length);
            this.get('showHiddenBox').css('display', shown<comments.length?'block':'none');
        },
                
        renderComment: function(comment){
            var view = this.getCommentView(comment);
            view.render();
            return view;
        },
        
        getCommentView: function(comment){
            var view = _.getItem(this.get('commentViews'), comment.id);
            if(!view){
                var options = {model: comment};
                var div = this.$('#comment-'+comment.id).restoreParserAttrs();
                if(div.length){
//                    view.setElement(div[0]);
//                    options.templateSelector = '';
                    options.el = div[0];
                }else{
                    options.el = this.$('#comment-view-template').html();
                    
                }
                view = new $.brx.CommentView(options);
                view.$el.attr('id', 'comment-'+comment.id);
                view.$el.removeAttr('widget-template');
                this.set('commentViews.'+comment.id, view);
            }else{
                view.setModel(comment);
            }
            
            return view;
        },
        
        removeCommentView: function(comment){
            this.getCommentView(comment).remove();
            delete(this.options.commentViews[comment.id]);
            this.get('views.shown').text(_.template('Показано <%= shown %> из <%= count %>', {
                shown: this.get('commentsBox').find('.brx-comment').length,
                count: this.get('comments').models.length
            }));
            this.get('views.total').text(this.get('comments').models.length);
            var children = this.get('comments').where({comment_parent: comment.id});
            for(var i in children){
                var child = children[i];
                child.trigger('change');
            }
        
        },
                
        animateCommentView: function(view, cls){
            cls = cls ||'comment_refreshed';
            view.$el.addClass(cls).removeClass(cls, 1000, 'easeInQuart');
        },
                
        onCommentPosted: function(comment){
            var view = this.renderComment(comment);
            if('asc' === this.get('order')){
                this.get('commentsBox').append(view.el);
            }else{
                this.get('commentsBox').prepend(view.el);
            }
            var oldShown = this.getInt('shown');
            this.setInt('shown', oldShown + 1);
            this.animateCommentView(view);
            this.get('views.shown').text(_.template('Показано <%= shown %> из <%= count %>', {
                shown: this.get('commentsBox').find('.brx-comment').length,
                count: this.get('comments').models.length
            }));
            this.get('views.total').text(this.get('comments').models.length);
        },

                
        showMoreComments: function(){
            var oldShown = this.getInt('shown');
            this.setInt('shown', oldShown + this.getInt('perPage'));
            this.renderComments(oldShown);
        },
                
        getPagesVisible: function(){
            return this.getInt('page');
        },
                
        setPagesVisible: function(pages){
            return this.setInt('page', pages);
        },
                
//        getShown
                
        getEditor: function(comment){
            var editor = this.get('commentEditor');
            if(comment){
                editor.setModel(comment);
            }
            return editor;
        },
                
        editComment: function(comment){
            var view = this.getCommentView(comment);
            var editor = this.getEditor(comment);
            view.$el.addClass('editing').hide().after(editor.el);
            editor.$el.show();
            editor.inputs('comment_content').focus();
            this.get('buttonsBox').show();
        },
                
        onCommentUpdated: function(comment){
            var view = this.getCommentView(comment);
//            var editor = this.getEditor();
            view.$el.removeClass('editing').show();
            this.animateCommentView(view);
            this.showBottomEditor();
//            editor.$el.hide();
        },
                
        onEditorCanceled: function(comment){
            if(comment && comment.id){
                var view = this.getCommentView(comment);
                view.$el.show();
            }
            this.showBottomEditor();
        },
                
        replyToComment: function(comment){
            var view = this.getCommentView(comment);
            view.$el.addClass('reply_to');
            var editor = this.getEditor();
            editor.replyTo(comment);
            if('asc' === this.get('order')){
                view.$el.after(editor.el);
            }else{
                view.$el.before(editor.el);
            }
            editor.$el.show();
            editor.inputs('comment_content').focus();
            this.get('buttonsBox').show();
        },
                
        onCommentReplied: function(comment){
//            var replyTo = this.get('comments').get(comment.getParentId());
//            var view = getCommentView(comment);
            this.get('commentsBox').find('.reply_to').removeClass('reply_to');
//            var view = this.getCommentView(comment);
//            var editor = this.getEditor();
//            view.$el.show();
//            editor.$el.hide();
            this.showBottomEditor();
        },
                
        onReplyCanceled: function(comment){
//            var view = this.getCommentView(comment);
//            view.$el.removeClass('reply_to');
            this.get('commentsBox').find('.reply_to').removeClass('reply_to');
            this.onEditorCanceled();
        },
                
        showBottomEditor: function(){
    
            this.get('commentsBox').find('.editing').removeClass('editing').show();
            this.get('commentsBox').find('.reply_to').removeClass('reply_to');
            
            var editor = this.getEditor();
            editor.setFormFieldStateClear('comment_content');
            if('asc' === this.get('order')){
                editor.$el.insertAfter(this.get('commentsBox')).show();
            }else{
                editor.$el.insertBefore(this.get('commentsBox')).show();
            }
            editor.setBlankModel();
            this.get('buttonsBox').hide();
        }
    });
    
    _.declare('brx.CommentView', $.brx.View, {
        options: {
//            templateSelector: '#comment-view-template'
            full: false
        },
        
        postCreate: function(){
            console.log('created');
            this.listenTo(this.model, 'change', $.proxy(this.render, this));
//            this.listenTo(this.model, 'reset', $.proxy(this.render, this));
            
        },
        
        render: function(){
//            var animate = animate || false;
//    window.moment.lang('ru');
            var comment = this.getModel();
            if(_.empty(comment.id)){ 
                return;
            }
            this.get('views.date').text(moment(comment.getDate()).format('D MMMM YYYY HH:mm'));
//            this.get('views.content').html(comment.getContent());
            this.set('full', /<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(comment.getContent()));
            if(comment.getContent().length > 300 && !this.get('full')){
                this.get('views.content').html($.brx.utils.truncate(comment.getContent(), 300));
                this.get('links.unfoldComment').css('display', 'inline');
            }else{
                this.get('views.content').html(comment.getContent());
                this.get('links.unfoldComment').hide();
            }
            if(comment.getParentId()){
                var collection = comment.collection || $.wp.comments[comment.getPostId()];
                var replyTo = collection.get(comment.getParentId());
                this.get('views.replyTo').html(replyTo?_.template('@<%=to%>: ', {to: replyTo.getAuthorName()}):"[в ответ на удаленный комментарий]\n");
            }else{
                this.get('views.replyTo').html('');
            }
            var user = parseInt(comment.getUserId())?
                $.wp.users.get(parseInt(comment.getUserId())):null;
            var link = user?user.getProfileLink():comment.getUrl();
            if(link && this.get('links.userProfile').is('span')){
                var a = $('<a href="" class="user_link"></a>');
                this.get('links.userProfile')
                    .find('*').appendTo(a);
                a.insertAfter(this.get('links.userProfile'));
                this.get('links.userProfile').remove();
                this.set('links.userProfile', a);
            }else if(!link && this.get('links.userProfile').is('a')){
                var span = $('<span class="user_link"></span>');
                this.get('links.userProfile')
                    .find('*').appendTo(span);
                span.insertAfter(this.get('links.userProfile'));
                this.get('links.userProfile').remove();
                this.set('links.userProfile', span);
            }
            if(link){
                var re = new RegExp('^(https?:\/\/)|\/');
                this.get('links.userProfile')
                    .attr('href', re.test(link)?link:'http://'+link);
            }
            this.get('links.userProfile')
//                    .attr('href', user?user.getProfileLink():comment.getUrl())
                .find('img.avatar')
                    .attr('src', $.brx.utils.gravatar(comment.getEmail(), 96));
            this.get('views.userId').val(comment.getUserId());
            this.get('views.userName').text(user?user.getDisplayName():comment.getAuthor());
            if($.wp.currentUser.id){
                this.$el.unbind('mouseenter').mouseenter($.proxy(function(event){this.get('toolsBox').show();}, this));
                this.$el.unbind('mouseleave').mouseleave($.proxy(function(event){this.get('toolsBox').hide();}, this));
            }
            this.get('links.editComment').css('display', comment.canModify()?'inline':'none');
            this.get('links.deleteComment').css('display', comment.canModify()?'inline':'none');
            var karma = comment.getKarma();
            this.get('views.karma')
                    .removeClass('negative_karma positive_karma')
                    .text(karma>0?'+'+karma:karma);
            this.$el.removeClass('negative_karma positive_karma');
            
            if(karma){
                this.get('views.karma')
                        .addClass(karma<0?'negative_karma':'positive_karma');
                this.$el.addClass(karma<0?'negative_karma':'positive_karma');

            }
            var delta = comment.getKarmaDelta();
            if(delta){
                this.get('views.karmaDelta')
                    .removeClass(delta>0?'negative_karma_delta':'positive_karma_delta')
                    .addClass(delta<0?'negative_karma_delta':'positive_karma_delta');
                if(delta > 0){
                    this.get('links.voteUp').addClass('no_vote_up');
                    this.get('links.voteDown').removeClass('no_vote_down');
                }else{
                    this.get('links.voteUp').removeClass('no_vote_up');
                    this.get('links.voteDown').addClass('no_vote_down');
                }
            }else{
                this.get('views.karmaDelta')
                    .removeClass('negative_karma_delta positive_karma_delta');
                this.get('links.voteUp').removeClass('no_vote_up');
                this.get('links.voteDown').removeClass('no_vote_down');
            }
            this.get('views.karmaDelta')
                .text(delta>0?'+'+delta:delta);
            var statusClass = '';
            var statusMessage = '';
            switch(comment.getApproved()){
                case '0':
                case 0:
                    statusClass = 'comment_moderated';
                    statusMessage = 'Комментарий находится на модерации, другие пользователи его не видят';
                    break;
                case 'spam':
                    statusClass = 'comment_spam';
                    statusMessage = 'Комментарий помечен как спам, другие пользователи его не видят';
                    break;
            }
            this.$el.removeClass('comment_moderated comment_spam').addClass(statusClass);
            
            this.get('views.status').text(statusMessage);
        },
                
        showSpinner: function(text){
            this.get('spinner').show(text);
        },
                
        hideSpinner: function(){
            this.get('spinner').hide();
        },
                
        replyToComment: function(){
            Backbone.Events.trigger('brx.Comments.replyToComment', this.getModel());
        },
                
        editComment: function(){
            Backbone.Events.trigger('brx.Comments.editComment', this.getModel());
        },
        
        deleteComment: function(){
//            $.brx.modalConfirm('Удалить комментарий?<br/>"'+this.getModel().getContent()+'"', $.proxy(function(){
            $.brx.Modals.confirm('Удалить комментарий?<br/>"'+this.getModel().getContent()+'"', $.proxy(function(){
                this.destroyModel({
                    spinnerMessage: 'Удаление...',
                    errorMessage: 'Ошибка удаления комментария'
                });
            }, this));
        },
                
        voteUp: function(){
            var delta = this.getModel().getKarmaDelta();
            if(delta > 0){
                return;
            }
            this.showSpinner('Мне нравится...');
            this.getModel().voteUp($.proxy(this.hideSpinner, this));
        },
        
        voteDown: function(){
            var delta = this.getModel().getKarmaDelta();
            if(delta < 0){
                return;
            }
            this.showSpinner('Мне не нравится...');
            this.getModel().voteDown($.proxy(this.hideSpinner, this));
        },
                
        unfoldComment: function(){
            this.set('full', true);
            this.render();
        }
        
        
    });
    
    _.declare('brx.CommentEditor', $.brx.FormView, {
        options: {
            postId: 0,
            mode: 'add',
            replyTo: null,
            stored: {}
        },
        
        postCreate: function(){
            this.set('avatarView', this.get('userAuthorizedBlock').find('img.avatar'));
            this.initFields();
            this.setupResizableTextarea('comment_content');
            if(!this.model){
                this.setBlankModel();
            }
            this.createPlaceholdersFromLabels();
            this.setupFieldsChecks();
//            this.buttons('save').unbind('click').click($.proxy(this.buttonSaveClicked, this));
        },
        
        setModel: function(model){
            console.dir({'setmodel': model});
            this.model = model;
            if(this.get('replyTo')){
                this.set('mode', 'reply');
            }else{
                this.set('mode', model.id?'edit':'add');
            }
            this.render();
        },
                
        setBlankModel: function(parent){
            var model = new $.wp.CommentModel({
                comment_post_ID: this.get('postId'),
                comment_parent: _.isObject(parent)?parent.id:0,
                user_id: $.wp.currentUser.id,
                comment_author: $.wp.currentUser.id?
                    $.wp.currentUser.getDisplayName()||$.wp.currentUser.getLogin():
                    this.get('stored.name'),
                comment_author_email: $.wp.currentUser.id?
                    $.wp.currentUser.getEmail():
                    this.get('stored.email'),
                comment_author_url: $.wp.currentUser.id?
                    $.wp.currentUser.getUrl():
                    this.get('stored.url')
            });
            this.set('replyTo', parent);
            this.setModel(model);
        },
                
        replyTo: function(comment){
//            this.set('replyTo', comment);
            this.setBlankModel(comment);
//            var model = new $.wp.CommentModel({
//                comment_post_ID: this.get('postId'),
//                comment_parent: comment.id
//            });
//            this.setModel(model);
        },
                
        render: function(){
            var comment = this.getModel();
            this.setFieldValue('post_id', comment.getPostId());
            this.setFieldValue('parent_id', comment.getParentId());
            this.setFieldValue('comment_content', comment.getContent());
            this.resizeTextarea('comment_content');
//            this.inputs('comment').val(comment.getContent());
            this.setFieldValue('comment_author', comment.getAuthor());
            this.setFieldValue('comment_author_email', comment.getEmail());
            this.setFieldValue('comment_author_url', comment.getUrl());
            this.buttons('cancel').css('display', this.get('mode')!=='add'?'inline':'none');
            switch(this.get('mode')){
                case 'add':
//                    this.setLabelText('comment_content','Ваш комментарий')
                    this.buttons('save').text('Отправить');
                    break;
                case 'reply':
                    var parent = $.wp.comments[comment.getPostId()].get(comment.getParentId());
//                    this.setLabelText('comment_content', _.template('Ваш ответ для @<%=name %>',{name: parent.getAuthor()}));
                    this.buttons('save').text('Ответить');
//                    this.inputs('comment_content').select();
                    break;
                case 'edit':
//                    this.setLabelText('comment_content','Редактирование комментария')
                    this.buttons('save').text('Обновить');
//                    this.inputs('comment_content').select();
                    break;
            }
            if(comment.getEmail()){
                this.get('avatarView').attr('src', $.brx.utils.gravatar(comment.getEmail(), 96));
            }
//            this.inputs('comment').text(comment.get('content'))
//            this.inputs('name')
        },
                
        checkForm: function(){
            var valid = true;
            if(!$.wp.currentUser.id){
                valid = this.checkField('comment_author') && valid;
                valid = this.checkField('comment_author_email') && valid;
                valid = this.checkField('comment_author_url') && valid;
            }
            valid = this.checkField('comment_content') && valid;
            
            return valid;
        },
                
        buttonSaveClicked: function(event){
            event.preventDefault();
            if(!this.checkForm()){
                return;
            }
            var data = {
                comment_content: this.getFieldValue('comment_content')
            };
            if(!$.wp.currentUser.id){
                this.options.stored.name = data['comment_author'] = this.getFieldValue('comment_author');
                this.options.stored.email = data['comment_author_email'] = this.getFieldValue('comment_author_email');
                this.options.stored.url = data['comment_author_url'] = this.getFieldValue('comment_author_url');
            }
            this.saveModel(data, {
                spinnerFieldId: 'comment_content',
                spinnerMessage: 'Отправка данных...',
                errorMessage: 'Ошибка добавления комментария',
                success: $.proxy(function(model, response, options){
//                    this.hideFieldSpinner('comment_content');
                    if(0 === response.code){
                        console.dir({'success': arguments});
                        $.wp.comments[model.getPostId()].set([model], {remove:false});
                        var event = 'brx.CommentEditor.commentCreated';
                        switch(this.get('mode')){
                            case 'edit':
                                event = 'brx.CommentEditor.commentUpdated';
//                                this.$el.hide();
                                break;
                            case 'reply':
                                this.set('replyTo', null);
                                event = 'brx.CommentEditor.commentReplied';
//                                this.$el.hide();
                                break;
                        }

                        Backbone.Events.trigger(event, model);
                        this.setBlankModel();
                    }else{
//                        this.handleAjaxErrors(response);
//                        this.showMessage();
                    }
                },this)
            });
//            this.showFieldSpinner('comment_content');
//            this.getModel().save(data, {
//                wait: true,
//                silent: true,
//                success: $.proxy(function(model, response, options){
//                    this.hideFieldSpinner('comment_content');
//                    if(0 === response.code){
//                        console.dir({'success': arguments});
//                        $.wp.comments[model.getPostId()].set([model], {remove:false});
//                        var event = 'brx.CommentEditor.commentCreated';
//                        switch(this.get('mode')){
//                            case 'edit':
//                                event = 'brx.CommentEditor.commentUpdated';
////                                this.$el.hide();
//                                break;
//                            case 'reply':
//                                this.set('replyTo', null);
//                                event = 'brx.CommentEditor.commentReplied';
////                                this.$el.hide();
//                                break;
//                        }
//
//                        Backbone.Events.trigger(event, model);
//                        this.setBlankModel();
//                    }else{
//                        this.handleAjaxErrors(response);
//                        this.showMessage();
//                    }
//                },this),
//                error: $.proxy(function(model, xhr, options){
//                    console.dir({'fail': arguments});
//                    this.hideFieldSpinner('comment_content');
//                    var message = $.brx.utils.processFail(xhr) 
//                        || 'Ошибка добавления комментария';
//                    this.setMessage(message, true);
//                    this.showMessage();
//                },this)
//            });
        },
                
        buttonCancelClicked: function(event){
            event.preventDefault();
            this.$el.hide();
            var event = 'brx.CommentEditor.updateCanceled';
            switch(this.get('mode')){
                case 'edit':
                    event = 'brx.CommentEditor.updateCanceled';
                    Backbone.Events.trigger(event, this.getModel());
                    break;
                case 'reply':
                    event = 'brx.CommentEditor.replyCanceled';
                    this.set('replyTo', null);
                    Backbone.Events.trigger(event, this.get('replyTo'));
                    break;
            }
            
        },
                
        refreshComments: function(){
            Backbone.Events.trigger('brx.Comments.refresh');
        }
    });
}(jQuery, _, Backbone));


