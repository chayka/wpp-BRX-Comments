<?php

/*
  Plugin Name: wpp-BRX-Comments
  Plugin URI: http://AnotherGuru.me/
  Description: Well-made comments plugin.
  Version: 1.0
  Author: Boris Mossounov
  Author URI: http://facebook.com/mossounov
  License: GPL2
 */


//define( 'WPP_BRX_COMMENTS_PATH', plugin_dir_path(__FILE__) );
//define( 'WPP_BRX_COMMENTS_URL', preg_replace('%^[\w\d]+\:\/\/[\w\d\.]+%', '',plugin_dir_url(__FILE__)) );

//require_once 'application/helpers/OptionHelper_Comments.php';
//require_once 'widgets-Comments.php';

//ZF_Query::registerApplication('WPP_BRX_COMMENTS', WPP_BRX_COMMENTS_PATH.'application', 
//        array('comment'));
//require_once 'application/helpers/UrlHelper_wpp_BRX_Comments.php';

class wpp_BRX_Comments extends WpPlugin{
    const NLS_DOMAIN = "Comments";
    
    protected static $instance = null;
    
    protected static $fieldsOrder = array(
                        'user',
                        'spinner',
                        'date',
                        'voting',
                        'content',
                        'status',
                        'tools',
                    );
    
    public static function initPlugin() {
        self::$instance = new wpp_BRX_Comments(__FILE__, array('comment'));
    }

    public function registerResources($minimize = false){
        
        $this->registerStyle('jquery-brx-comments', 'bem-comments.less');
        $this->registerScript('jquery-brx-comments', 'jquery.brx.comments.js', array('jquery-brx-form'));
        $this->registerStyle('backbone-brx-comments', 'brx.Comments.view.less', array('backbone-brx-spinners'));
        $this->registerScript('backbone-brx-comments', 'brx.Comments.view.js', array('backbone-brx', 'backbone-wp-models', 'backbone-brx-spinners', 'moment'));

    }
    
    public function registerActions(){

    }
    
    public function registerFilters(){
        
    }
    public function registerConsolePages() {

    }

    public static function setFieldsOrder($order = array()){
        self::$fieldsOrder = $order;
    }
    
    public static function blockStyles($block = true){
        self::$instance->needStyles = !$block;
    }
    
    public static function renderComments($post, $title = 'Комментарии', $fieldsOrder = array()){
        if(!$post){
            return;
        }
        if(is_object($post)){
            if(!($post instanceof PostModel)){
                $post = PostModel::unpackDbRecord($post);
            }
        }elseif(is_string($post)){
            $post = PostModel::selectById($post);
        }
        
        if(empty($fieldsOrder)){
            $fieldsOrder = self::$fieldsOrder;
        }
        
        $view = new Zend_View();
        $view->setScriptPath(WPP_BRX_COMMENTS_PATH.'application/views/scripts/');
        $view->title = $title;
        $view->post = $post;
        $view->order = get_site_option('comment_order', 'asc');
        $view->perPage = get_site_option('comments_per_page', 50);
        $view->fieldsOrder = $fieldsOrder;
//        $view->initialPage = get_site_option('defaults_comment_page', 'newest');
        echo $view->render('comment/brx.CommentsList.phtml');
        wp_enqueue_script('backbone-brx-comments');
        if(self::$instance->needStyles){
            wp_enqueue_style('backbone-brx-comments');
        }
    }

    public function deletePost($postId, $post) {
        
    }

    public function savePost($postId, $post) {
        
    }
    
    public function registerCustomPostTypes() {
        
    }

    public function registerMetaBoxes() {
        
    }

    public function registerSidebars() {
        
    }

    public function registerTaxonomies() {
        
    }

}

add_action('init', array('wpp_BRX_Comments', 'initPlugin'));
    