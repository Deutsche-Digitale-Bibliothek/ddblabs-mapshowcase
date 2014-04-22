Javascript
==========

Libraries
~~~~~~~~~

* jQuery
* jQuery UI
* jQuery Mobile
* Openlayers

Internal development
~~~~~~~~~~~~~~~~~~~~

* init_namespace.js
    .. js:data:: DDB
        Initializes the main DDB object. all further data is stored in this object instead of global namespace.

* main.js
    .. js:function:: main()
        Initializes the map and panels by calling the `initialize_map` and `initialize_panel` methods. Also adds the overview to the map. This function is executed on DOM-Ready.

* ddbsearch.js
    .. js:function:: DDB.Search (OpenLayers.Control {})
         Add the DDB Search to the panel and OL Vector Layer for result display to the map.

* panel.js
    .. js:function:: initialize_panel()
        Initializes the panel shown on the left side of the map. Adding tabs and accordion navigation functionality.
* map.js
* nominatim_autocomplete.js
* nominatim_controller.js
