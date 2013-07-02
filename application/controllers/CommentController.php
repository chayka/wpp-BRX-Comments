<?php

require_once 'application/models/posts/CommentModel.php';
require_once 'application/helpers/EmailHelper.php';
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CommentsController
 *
 * @author borismossounov
 */
class Comments_CommentController extends Zend_Controller_Action {

    //put your code here
    public function init() {
        Util::turnRendererOff();
    }

    public function publishAction() {
        global $wpdb;
        InputHelper::storeInput();
//        AclHelper::apiAuthRequired($this->view->render('auth/comment.publish.phtml'));
//        die('!');
        InputHelper::unstoreInput();
//        AclHelper::apiRepRequired(0);
        $postId = InputHelper::getParam('post_id', 0);
        $post = get_post($postId);

        if (empty($post->comment_status)) {
            do_action('comment_id_not_found', $postId);
            exit;
        }

        // get_post_status() will get the parent status for attachments.
        $status = get_post_status($post);

        $status_obj = get_post_status_object($status);

        if (!comments_open($postId)) {
            ErrorHelper::error(__('Sorry, comments are closed for this item.'), 'comment_closed');
        } elseif ('trash' == $status) {
            ErrorHelper::error(__('Sorry, comments are closed for this item.'), 'comment_on_trash');
        } elseif (!$status_obj->public && !$status_obj->private) {
            ErrorHelper::error(__('Sorry, comments are closed for this item.'), 'comment_on_draft');
        } elseif (post_password_required($postId)) {
            ErrorHelper::error(__('Sorry, comments are closed for this item.'), 'comment_on_password_protected');
        } 
        
        $comment_author = InputHelper::getParam('author');
        $comment_author_email = InputHelper::getParam('email');
        $comment_author_url = InputHelper::getParam('url');
        $comment_content = InputHelper::getParam('comment');

        // If the user is logged in
        $user = wp_get_current_user();
        $user_ID = $user->ID;
        if ($user->exists()) {
            if (empty($user->display_name)){
                $user->display_name = $user->user_login;
            }
            $comment_author = $wpdb->escape($user->display_name);
            $comment_author_email = $wpdb->escape($user->user_email);
            $comment_author_url = $wpdb->escape($user->user_url);
            if (current_user_can('unfiltered_html')) {
                if (wp_create_nonce('unfiltered-html-comment_' . $postId) != $_POST['_wp_unfiltered_html_comment']) {
                    kses_remove_filters(); // start with a clean slate
                    kses_init_filters(); // set up the filters
                }
            }
        } else {
            if (get_option('comment_registration') || 'private' == $status)
                ErrorHelper::error(__('Sorry, you must be logged in to post a comment.'), ErrorHelper::CODE_AUTH_REQUIRED);
        }

        $comment_type = '';

        if ('' == $comment_content) {
            $errors['comment'] = 'Введите комментарий';
            ErrorHelper::error($errors);
        }

        $comment_parent = InputHelper::getParam('comment_parent', 0);
	$parent_status = ( 0 < $comment_parent ) ? wp_get_comment_status($comment_parent) : '';
	$comment_parent = ( 'approved' == $parent_status || 'unapproved' == $parent_status ) ? $comment_parent : 0;

        $commentdata = compact('comment_post_ID', 'comment_author', 'comment_author_email', 'comment_author_url', 'comment_content', 'comment_type', 'comment_parent', 'user_ID');
	$commentdata['comment_date']     = current_time('mysql');
	$commentdata['comment_date_gmt'] = current_time('mysql', 1);
        $comment_approved = wp_allow_comment($commentdata);
        
        $comment = new CommentModel();
        $comment->setAuthor($comment_author);
        $comment->setEmail($comment_author_email);
        $comment->setUrl($comment_author_url);
        $comment->setContent($comment_content);
        $comment->setType($comment_type);
        $comment->setParentId($comment_parent);
        $comment->setUserId($user_ID);
        $comment->setPostId($postId);
        $comment->setIsApproved($comment_approved);

        $comment_ID = $comment->insert();

	if ( 'spam' !== $comment_approved ) { // If it's spam save it silently for later crunching
		if ( '0' == $comment_approved ){
			wp_notify_moderator($comment_ID);
                }
                
//                $post = PostModel::unpackDbRecord($post);
//                $author = UserModel::selectById($post->getUserId());
//                EmailHelper::userCommentedPost($author, $comment, $post);

                
	}

        $comment = CommentModel::selectById($comment_ID);
        do_action('set_comment_cookies', $comment->getWpComment(), $user);

        $sinceCommentId = InputHelper::getParam('since_comment_id', -1);
        if ($sinceCommentId >= 0) {
            $comments = CommentModel::selectPostComments($postId, $sinceCommentId);
            JsonHelper::respond(array('comments' => $comments, 'comment_id' => $comment_id));
        }

        JsonHelper::respond($comment);
    }
    
    public function updateAction(){
        Util::turnRendererOff();
        InputHelper::storeInput();
//        AclHelper::apiAuthRequired($this->view->render('auth/comment.update.phtml'));
        InputHelper::unstoreInput();
//        AclHelper::apiRepRequired(0);
        $commentId = InputHelper::getParam('comment_id');
        $content = InputHelper::getParam('comment');
        $comment = CommentModel::selectById($commentId);
        AclHelper::apiOwnershipRequired($comment);
        if(!$comment){
            ErrorHelper::error('Комментарий не обнаружен', 'comment_not_found');
        }
        $comment->setContent($content);
        try{
            $comment->update();
            JsonHelper::respond($comment);
        }  catch (Exception $e){
            ErrorHelper::error($e->getMessage(), 'wpdb_error');
        }
        ErrorHelper::error('Комментарий не обновлен', 'comment_not_updated');
    }
    
    public function deleteAction(){
        Util::turnRendererOff();
//        AclHelper::apiAuthRequired();
//        AclHelper::apiRepRequired(0);
        $commentId = InputHelper::getParam('comment_id');
        $comment = CommentModel::selectById($commentId);
        AclHelper::apiOwnershipRequired($comment);
        if($commentId && CommentModel::deleteById($commentId)){
            JsonHelper::respond();
        }
        ErrorHelper::error('Комментарий не был удален', 'comment_not_deleted');
    }

    public function voteUpAction(){
        session_start();
        $commentId = InputHelper::getParam('id', 0);
        $comment = CommentModel::selectById($commentId, false);
        $comment->voteUp();
        session_commit();
        JsonHelper::respond($comment);
    }

    public function voteDownAction(){
        session_start();
        $commentId = InputHelper::getParam('id', 0);
        $comment = CommentModel::selectById($commentId, false);
        $comment->voteDown();
        session_commit();
        JsonHelper::respond($comment);
    }


}

