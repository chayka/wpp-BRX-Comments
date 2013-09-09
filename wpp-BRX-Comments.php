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


define( 'WPP_BRX_COMMENTS_PATH', plugin_dir_path(__FILE__) );
define( 'WPP_BRX_COMMENTS_URL', preg_replace('%^[\w\d]+\:\/\/[\w\d\.]+%', '',plugin_dir_url(__FILE__)) );

//require_once 'application/helpers/OptionHelper_Comments.php';
//require_once 'widgets-Comments.php';

ZF_Query::registerApplication('WPP_BRX_COMMENTS', WPP_BRX_COMMENTS_PATH.'application', 
        array('comment'));
//require_once 'application/helpers/UrlHelper_wpp_BRX_Comments.php';

class wpp_BRX_Comments {
    const NLS_DOMAIN = "Comments";
    
    protected static $fieldsOrder = array(
                        'user',
                        'spinner',
                        'date',
                        'voting',
                        'content',
                        'status',
                        'tools',
                    );
    
    protected static $needStyles = true;
    
    public static function baseUrl(){
        echo WPP_BRX_COMMENTS_URL;
    }
    
    public static function dbUpdate() {
        WpDbHelper::dbUpdate('1.0', 'wpp_brx_comments_db_version', WPP_BRX_COMMENTS_PATH.'res/sql');
    }
    
    public static function installPlugin() {
        LessHelper::addImportDir(WPP_BRX_COMMENTS_PATH.'res/css');
        self::registerResources();
        self::registerActions();
        self::registerFilters();
        
    }

    public static function registerResources($minimize = false){
        wp_register_style('jquery-brx-comments', WPP_BRX_COMMENTS_URL.'res/css/bem-comments.less');
        wp_register_script('jquery-brx-comments', WPP_BRX_COMMENTS_URL.'res/js/jquery.brx.comments.js', array('jquery-brx-form'));
        wp_register_style('backbone-brx-comments', WPP_BRX_COMMENTS_URL.'res/css/brx.Comments.view.less', array('backbone-brx-spinners'));
        wp_register_script('backbone-brx-comments', WPP_BRX_COMMENTS_URL.'res/js/brx.Comments.view.js', array('backbone-brx', 'backbone-wp-models', 'backbone-brx-spinners', 'moment'));

    }
    
    public static function registerActions(){
//        add_action('admin_menu', array('wpp_BRX_Comments', 'registerConsolePages'));
//        add_action('add_meta_boxes', array('wpp_BRX_Comments', 'addMetaBoxSearchOptions') );
//        add_action('lucene_index_post', array('wpp_BRX_Comments', 'indexPost'), 10, 2);
//        add_action('lucene_delete_post', array('wpp_BRX_Comments', 'deletePost'), 10, 2);
//        add_action('save_post', array('wpp_BRX_Comments', 'savePost'), 90, 2);
//        add_action('save_post', array('wpp_BRX_Comments', 'indexPost'), 100, 2);
//        add_action('delete_post', array('wpp_BRX_Comments', 'deletePost'), 100, 2);
//        add_action('trashed_post', array('wpp_BRX_Comments', 'deletePost'), 100, 2);
//        
//        add_action('lucene_enable_indexer', array('wpp_BRX_Comments', 'enableIndexer'), 10);
//        add_action('lucene_disable_indexer', array('wpp_BRX_Comments', 'disableIndexer'), 10);
//        add_action('parse_request', array('wpp_BRX_Comments', 'parseRequest'));
//        add_action('wp_footer', array('wpp_BRX_Comments', 'addJQueryWidgets'));
        
    }
    
    public static function registerFilters(){
//        add_filter('post_type_link', array('wpp_BRX_Comments', 'postPermalink'), 1, 3);
//        add_filter('term_link', array('wpp_BRX_Comments', 'termLink'), 1, 3);
//        add_filter( 'the_search_query', array('wpp_BRX_Comments', 'enableSearch' ));
//        add_filter('get_sample_permalink_html', array('wpp_BRX_Comments', 'getSamplePermalinkHtml'), 1, 4);
//        add_filter('manage_question_posts_columns', array('wpp_BRX_Comments', 'manageQuestionColumns'));
//        add_filter('manage_edit_question_sortable_columns', array('wpp_BRX_Comments', 'questionSortableColumns'));
//        add_action('delete_post', array('wpp_BRX_Comments', 'deletePost'), 10, 1);
//        add_filter('excerpt_more', array('wpp_BRX_Comments', 'excerptMore'));
//        add_filter('wp_insert_post_data', array('wpp_BRX_Comments', 'autoSlug'), 10, 1 );
//        add_filter('post_link', array('wpp_BRX_Comments', 'postPermalink'), 1, 3);
//        add_filter('get_comment_link', array('wpp_BRX_Comments', 'commentPermalink'), 1, 2);
//        add_filter('wp_nav_menu_objects', array('wpp_BRX_Comments', 'wp_nav_menu_objects'), 1, 2);
//        add_filter('media_upload_tabs', array('wpp_BRX_Comments', 'mediaUploadTabs'), 1, 1);
//        add_filter('excerpt_length', array('wpp_BRX_Comments', 'excerpt_length'), 1, 1);
//        add_filter('wp_nav_menu_items', array('wpp_BRX_Comments', 'wp_nav_menu_items'), 1, 2);
//        add_filter('wp_nav_menu', array('wpp_BRX_Comments', 'wp_nav_menu'), 1, 2);
        
    }
    public static function registerConsolePages() {
//        add_submenu_page('edit.php?post_type='.wpp_BRX_Comments::POST_TYPE_CATALOG_ITEM, 
//                'Импорт каталога', 'Импорт', 'update_core', 'ilat-catalogue-import-items', 
//                array('wpp_BRX_Comments', 'renderConsolePageImportItems'), '', null); 
//        add_submenu_page('edit.php?post_type='.wpp_BRX_Comments::POST_TYPE_CATALOG_ITEM, 
//                'Настройка полей', 'Настройка полей', 'update_core', 'ilat-catalogue-setup-fields', 
//                array('wpp_BRX_Comments', 'renderConsolePageSetupFields'), '', null); 
//        add_submenu_page('edit.php?post_type='.wpp_BRX_Comments::POST_TYPE_CATALOG_ITEM, 
//                'Настройка каталога', 'Настройка каталога', 'update_core', 'ilat-catalogue-setup-catalog', 
//                array('wpp_BRX_Comments', 'renderConsolePageSetupCatalog'), '', null); 
//        add_submenu_page('edit.php?post_type='.wpp_BRX_Comments::POST_TYPE_SERVICE_ITEM, 
//                'Импорт услуг', 'Импорт', 'update_core', 'ilat-catalogue-import-services', 
//                array('wpp_BRX_Comments', 'renderConsolePageImportServices'), '', null); 
//        add_menu_page('Поисковая система', 'Поисковая система', 'update_core', 'comments-admin', 
//                array('wpp_BRX_Comments', 'renderConsolePageIndexer'), '', null); 
//        add_submenu_page('comments-admin', 
//                'Индексация информации', 'Индексация информации', 'update_core', 'comments-indexer', 
//                array('wpp_BRX_Comments', 'renderConsolePageIndexer'), '', null); 
//        add_submenu_page('comments-admin', 
//                'Настройка', 'Настройка', 'update_core', 'comments-setup', 
//                array('wpp_BRX_Comments', 'renderConsolePageSetup'), '', null); 
    }


//    public static function renderConsolePageIndexer(){
//       echo ZF_Query::processRequest('/admin/index/', 'WPP_BRX_COMMENTS');	
//    }
//
//    public static function renderConsolePageSetup(){
//       echo ZF_Query::processRequest('/admin/setup-comments', 'WPP_BRX_COMMENTS');	
//    }
//
//    public static function renderConsolePageImportItems(){
//       echo ZF_Query::processRequest('/admin/import-items', 'WPP_BRX_COMMENTS');	
//    }
//
//    public static function renderConsolePageSetupFields(){
//       echo ZF_Query::processRequest('/admin/setup-fields', 'WPP_BRX_COMMENTS');	
//    }
//
//    public static function renderConsolePageSetupCatalog(){
//       echo ZF_Query::processRequest('/admin/setup-catalog', 'WPP_BRX_COMMENTS');	
//    }
//
//    public static function renderConsolePageImportServices(){
//       echo ZF_Query::processRequest('/admin/import-services', 'WPP_BRX_COMMENTS');	
//    }
    
    public static function setFieldsOrder($order = array()){
        self::$fieldsOrder = $order;
    }
    
    public static function blockStyles($block = true){
        self::$needStyles = !$block;
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
        if(self::$needStyles){
            wp_enqueue_style('backbone-brx-comments');
        }
    }
}




add_action('init', array('wpp_BRX_Comments', 'installPlugin'));
register_uninstall_hook(__FILE__, array('wpp_BRX_Comments', 'uninstallPlugin'));
    