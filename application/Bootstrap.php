<?php

class wpp_BRX_Comments_Bootstrap extends WpPluginBootstrap//Zend_Application_Bootstrap_Bootstrap
{
    const MODULE = 'wpp_BRX_Comments';

    public function run(){
        parent::run();
    }
    
    public function getModuleName() {
        return self::MODULE;
    }
    
    
    public function setupRouting(){
        $router = parent::setupRouting();
//        $router->addRoute('autocomplete-taxonomy', new Zend_Controller_Router_Route('autocomplete/taxonomy/:taxonomy', array('controller' => 'autocomplete', 'action'=>'taxonomy', 'module'=>self::MODULE)));

    }

}

