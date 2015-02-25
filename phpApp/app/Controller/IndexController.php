<?php
App::uses('AppController', 'Controller');

class IndexController extends AppController {

    /*********************************************************************
     *              CONTROLLER DATA MEMBERS
     *********************************************************************/

    public $name = "Index";    //name of the controller. Usually this is just the plural form of the primary model the controller uses
    // public $uses = array('MiModelo', "Modelo2");        //Allows a controller to access additional models. name of the current controller’s model must also be included if uses is present
    // public $components = array("Component1", "Component2");     //make available packages of logic that are shared between controllers

    /*********************************************************************
     *              CONTROLLER CALLBACKS METHODS
     *********************************************************************/

    public function beforeFilter() {
        parent::beforeFilter();
    }

    // public function afterFilter() {
        
    // }

    // public function beforeRender() {

    // }

    /*********************************************************************
     *              CONTROLLER METHODS (ACTIONS)
     *********************************************************************/

    public function isAuthorized($usuario) {
        return true;
    }

    public function index() {

    }

    public function chats() {
        
    }

    public function logout() {
        $this->Session->setFlash('Has finalizado tu sesión con éxito!');
        return $this->redirect($this->Auth->logout());
    }

    public function viewChat() {

    }

}