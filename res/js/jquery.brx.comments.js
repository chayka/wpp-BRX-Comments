(function( $ ) {
//    $.widgetTemplated( "brx.comments", $.brx.form, {
    $.widget( "brx.comments", $.brx.form, {
 
//        _parentPrototype: $.ui.templated.prototype,
        
        // These options will be used as defaults
        options: { 
            elementAsTemplate: true,
            items: {},

            postId: 0,
            storedComment: {}
        },
        
//        fields: {},
//        inputs: {},
//        labels: {},
//        hints: {},
//        buttons: {},
        
        isOwner: function(comment){
            var ownerId = parseInt(comment.user_id);
            return ownerId && ownerId == parseInt(window.currentUser.ID) 
                || 'administrator' == window.currentUser.role;
          
        },
        // Set up the widget
        postCreate: function() {
            console.log('brx.comments._create');
            $('form', this.getTemplate()).submit(function(event){event.preventDefault();});
            this.set('commentTemplate', $('#comment-template', this.getTemplate()));
            var commentsId = this.element.attr("id");
            var re = /comments-(\d+)/;
            var m = commentsId.match(re);
//            console.dir({commentsId:commentsId, m:m});
            this.set('postId', parseInt(m[1]));
            
            console.dir({populatedComments: comments[this.get('postId')]});
            this.set('comments', comments[this.get('postId')]);

            this.initField('comment');
            this.inputs('comment').placeholder({text:'Добавьте ваш комментарий...'});
            this.inputs('comment').blur($.proxy(
                this.checkCommentField, this));
            this.inputs('comment').focus($.proxy(function(){
                this.setFormFieldStateClear('comment');
                this.clearMessage();
            }, this));
            this.initField('content');
            this.set('storedComment', this.stored('comment.publish')||
                this.stored('comment.update')|| {});
            if(!$.brx.utils.empty(this.get('storedComment').post_id)
            && parseInt(this.get('postId'))!=parseInt(this.get('storedComment').post_id)){
                this.set('storedComment', {});
            }
            if(!$.brx.utils.empty(this.get('storedComment').comment_id)
            && $.brx.utils.empty(this.get('comments')[this.get('storedComment').comment_id])){
                this.set('storedComment', {});
            }
//            this.inputs('comment').blur();
            this.render();
            this.enableInputs();
//            this.get('spinner').template
//                .css('display', 'inline');
//            this.get('spinner').hide();
//            this.get('spinner').element.dialog({
//               autoOpen:false,
//               closeOnEscape: false,
//               draggable:false,
//               resizable:false,
//               modal:true,
//               height: 75,
//               open: function(event, ui) {console.dir({'ui': ui, 'event': $(event.target).prev()});$(".ui-dialog-titlebar-close", $(event.target).prev()).hide();$(event.target).prev().hide();}
//            });
            
            console.dir({commentsForm:this});
        },
        
        
        // Use the _setOption method to respond to changes to options
        _setOption: function( key, value ) {
            $.ui.templated.prototype._setOption.apply( this, arguments );
            switch( key ) {
                case "message":
                    break;
            }
 
            // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
            // In jQuery UI 1.9 and above, you use the _super method instead
//            this._super( "_setOption", key, value );
            $.brx.form.prototype._setOption.apply( this, arguments );
        },
        
        comments: function(key, value){
            if(value == undefined){
                if(key == undefined){
                    return this.get('comments');
                }else{
                    return this.get('comments.'+key);
                }
            }else{
                return this.set('comments.'+key, value);
            }
        },
        
        items: function(key, value){
            if(value == undefined){
                if(key == undefined){
                    return this.get('items');
                }else{
                    return this.get('items.'+key);
                }
            }else{
                return this.set('items.'+key, value);
            }
        },
        
        showEditorBox: function(commentId, animate){
            this.setFormFieldStateClear('comment');
            var oldCommentId = this.inputs('commentId').val();
            if(oldCommentId){
                this.items(oldCommentId).show();
            }
            this.inputs('commentId').val(commentId);
            if($.brx.utils.objLength(this.get('storedComment'))){
                this.inputs('content').val(this.get('storedComment').comment);
            }else{
                this.inputs('content').val(this.comments(commentId).content);
            }
            this.items(commentId).hide();
            this.get('editorBox').insertAfter(this.items(commentId)).show();
        },
        
        hideEditorBox: function(event){
            var oldCommentId = this.inputs('commentId').val();
            if(oldCommentId){
                this.items(oldCommentId).show();
            }
            this.get('editorBox').hide();
        },
        
        getCommentBox: function(commentId, animate){
            animate = animate || false;
            var existing = $('#comment-'+commentId, this.get('commentsBox'));
            existing = existing.length ? existing : false;
            console.dir({existing:existing});
            this.items(commentId, this.items(commentId) 
                || existing
                || this.get('commentTemplate').clone()
                    .attr('id', 'comment-'+commentId)
                    .appendTo(this.get('commentsBox'))
                    .show());
            if(animate){
                this.items(commentId).css('background-color', 'yellow')
                    .animate({
                        backgroundColor: "transparent"
                    }, 1000 );
            }
            return this.items(commentId);
        },
        
        removeCommentBox: function(commentId, animate){
            animate = animate || false;
            if(animate){
                this.items(commentId).hide('blind', {}, 1000, $.proxy(function(){
                    this.items(commentId).remove();
                    delete(this.options.items[commentId]);
                }, this))
            }else{
                this.items(commentId).remove();
                delete(this.options.items[commentId]);
            }
        },
        
        renderUser: function(element, user, avatarSize){
            avatarSize = avatarSize || 32;
            if($.brx.utils.empty(user)){
                return;
            }
            var title = "Пользователь";
            var name = user.display_name;
            switch(parseInt(user.pd_account_type)){
                case 0:
                    title = "Пользователь";
                    break;
                case 1:
                    title = "Эксперт";
                    break;
                case 2:
                    title = "Индивидуальный подрядчик";
                    if(user.pd_is_team){
                        title = "Бригада";
                        name = user.pd_team_title;
                    }
                    if(user.pd_is_legal){
                        title = "Подрядчик";
                        name = user.pd_team_title;
                    }
                    break;
            }

            var userLink = '/user/' + user.ID + '/' + user.user_login;
            var avatarView = element.find('img.avatar')
                .attr('src', $.brx.utils.gravatar(user.user_email, avatarSize));
            var idView = element.find('div.user_id')
                .text(user.ID);
            var nameView = element.find('div.name a')
                .attr('href', userLink).text(name);
            var reputationView = element.find('div.reputation')
                .text(user.pd_reputation);
            var titleView = element.find('div.title')
                .text(user.pd_title);
            var tags = [];
            if(user.pd_profession){
                tags = tags.concat(user.pd_profession.split(','));
            }
            if(user.pd_abilities){
                tags = tags.concat(user.pd_abilities.split(','));
            }
            if(user.pd_equipment){
                tags = tags.concat(user.pd_equipment.split(','));
            }
            if(user.pd_geography){
                tags = tags.concat(user.pd_geography.split(','));
            }
            var tagsView = element.find('div.tags')
                .text(tags.slice(0, 2).join(', '));
        },
        
        renderComment: function(comment, animate){
            animate = animate || false;
            if($.brx.utils.empty(comment.id)){ 
                return;
            }
                
            var item = this.getCommentBox(comment.id, animate);
            item.find('div.content').html(comment.content.replace(/\n/g, '<br/>'));
            var user = window.users[parseInt(comment.user_id)];
            
            this.renderUser(item.find('.user_item'), user);

            item.find('.ui-icon-trash').click($.proxy(function(event){
                $.brx.modalConfirm('Удалить комментарий?<br/>"'+comment.content+'"', $.proxy(function(){
                    this.deleteComment(comment.id);
                }, this))
            },this))
            item.find('.ui-icon-pencil').click($.proxy(function(event){
                this.showEditorBox(comment.id, true);
            },this))
            if(this.isOwner(comment)){
                item.unbind('mouseenter').mouseenter($.proxy(function(event){this.find('.comment_tools').show();}, item));
                item.unbind('mouseleave').mouseleave($.proxy(function(event){this.find('.comment_tools').hide();}, item));
            }
        },
        
        renderComments: function(comments, animate){
            animate = animate || false;
            comments = comments || this.comments();
            for(var i in comments){
                var comment = comments[i];
                this.renderComment(comment, animate);
            }
            
        },
        
        render: function(){
//            this.commentsBox.find('div.comment:visible').remove();
            this.renderComments();
            if($.brx.utils.objLength(this.get('storedComment'))){
                if(parseInt(this.get('storedComment').comment_id)){
                    this.showEditorBox(this.get('storedComment').comment_id);
                }else{
                    this.inputs('comment').data('placeholder').val(this.get('storedComment').comment);
                }
            }else{
                this.inputs('comment').data('placeholder').val('');
            }
       },
        
        refresh: function(){
        },
        
        checkCommentField: function(event){
//            var comment = this.inputs('comment').data('placeholder').val();
            return (event !== undefined || this.checkRequired('comment', 'Введите ваш комментарий'))
                ;
        },
        
        checkPublishForm: function(event){
            var valid = this.checkCommentField(event);
            return valid;
        },
        
        checkContentField: function(event){
//            var comment = this.inputs('comment').data('placeholder').val();
            return (event !== undefined || this.checkRequired('content', 'Введите ваш комментарий'))
                ;
        },
        
        checkUpdateForm: function(event){
            var valid = this.checkContentField(event);
            return valid;
        },
        
        processUpdateErrors: function(errors){
            for(key in errors){
                var errorMessage = errors[key];
                this.setFormFieldStateError('content', errorMessage );
            }
            
        },
        
        buttonPublishClicked: function(event){
            event.preventDefault();
            var isButtonClicked = true;//event.originalEvent.explicitOriginalTarget == event.currentTarget;
            if(isButtonClicked && this.checkPublishForm()){
                this.setFormFieldStateClear('comment');
                this.clearMessage();
                this.showFieldSpinner('comment', 'Добавление комментария...');
                this.disableInputs();
                $.ajax('/api/comment/publish', {
                    data:{
                        post_id: this.get('postId'),
                        comment: this.inputs('comment').data('placeholder').val()
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
                        if(data.payload.comments){
                            $.extend(this.options.comments, data.payload.comments);
                            this.renderComments(data.payload.comments, true);
                        }else{
                            this.comments(data.payload.id, data.payload);
                            this.renderComment(data.payload, true);
                        }
                        this.set('storedComment', {});
                        this.unstore('comment.publish');
                        this.inputs('comment').data('placeholder').val('');
//                        this.render();
                        console.info('Comment published');
                    }else{
//                        this.processErrors(data.message);
                          this.handleAjaxErrors(data);
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || 'Ошибка добавления комментария';
                    this.setMessage(message, true);
                },this))

                .always($.proxy(function(){
                    this.enableInputs();
                    this.hideFieldSpinner('comment');
                    this.showMessage();
                },this));
            }
        },
        
        buttonUpdateClicked: function(event){
            event.preventDefault();
            var isButtonClicked = true;//event.originalEvent.explicitOriginalTarget == event.currentTarget;
            if(isButtonClicked && this.checkUpdateForm()){
                this.setFormFieldStateClear('content');
                this.showFieldSpinner('content', 'Обновление комментария...');
                this.disableInputs();
                $.ajax('/api/comment/update', {
                    data:{
                        comment_id: this.inputs('commentId').val(),
                        comment: this.inputs('content').val()
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
                        this.comments(data.payload.id, data.payload);
                        this.renderComment(data.payload, true);
                        this.inputs('content').val('');
                        this.hideEditorBox();
                        this.set('storedComment', {});
                        this.unstore('comment.update');
//                        this.render();
                        console.info('Comment updated');
                    }else{
                        this.processUpdateErrors($.brx.utils.handleErrors(data));
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || 'Ошибка обновления комментария';
                    this.setFormFieldStateError('content', message);
                },this))

                .always($.proxy(function(){
                    this.enableInputs();
                    this.hideFieldSpinner('content');
                },this));
            }
        },
        
        deleteComment: function(commentId){
            if(true){
                this.showSpinner('Удаление комментария...');
                $.ajax('/api/comment/delete', {
                    data:{
                        comment_id: commentId
                    },
                    dataType: 'json',
                    type: 'post'
                })
                
                .done($.proxy(function(data){
                    console.dir({'data': data});
                    if(0 == data.code){
//                        this.render();
                        delete this.options.comments[commentId];
                        this.removeCommentBox(commentId, true);
                        console.info('Comment deleted');
                    }else{
//                        this.processErrors(data.message);
                          this.handleAjaxErrors(data);
                    }
                },this))
                
                .fail($.proxy(function(response){
                    var message = $.brx.utils.processFail(response) 
                        || 'Ошибка удаления комментария';
                    $.brx.modalAlert(message);
                },this))

                .always($.proxy(function(){
                    this.enableInputs();
                    this.hideSpinner();
                },this));
            }
        },
        
        // Use the destroy method to clean up any modifications your widget has made to the DOM
        destroy: function() {
            // In jQuery UI 1.8, you must invoke the destroy method from the base widget
//            $.Widget.prototype.destroy.call( this );
        // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
        }
    });
}( jQuery ) );

