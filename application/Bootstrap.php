<?php

class wpp_BRX_Comments_Bootstrap extends Zend_Application_Bootstrap_Bootstrap
{
    const MODULE = 'wpp_BRX_Comments';

    public function run(){
        $this->setupRouting();
    }
    
    public function setupRouting(){
        $front = Util::getFront();
        $cd = $front->getControllerDirectory();
        $front->addControllerDirectory($cd['default'], self::MODULE);        
        
        $router = $front->getRouter();

        $router->addRoute(self::MODULE, new Zend_Controller_Router_Route(':controller/:action/*', array('controller' => 'index', 'action'=>'index', 'module'=>self::MODULE)));
//        $router->addRoute('autocomplete-taxonomy', new Zend_Controller_Router_Route('autocomplete/taxonomy/:taxonomy', array('controller' => 'autocomplete', 'action'=>'taxonomy', 'module'=>self::MODULE)));

    }

}

