var SettingsPage = function(localsettings, indi) {
    this.localsettings = localsettings;
    this.indi = indi;
    SettingsPage.SETTING_DEVICE='setting_device';

    this.reload_devices = function() {
        $('#device').empty().val(null);
        $('#setting').empty().val(null);
        $('#setting-value').val(null);
        this.indi.get_devices(this.__on_devices_reloaded.bind(this));
    };

    this.reload_value = function() {
        var property = $('#setting').val();
        $('#setting-value').val(null);
        current_indi_device().get(property, this.__on_property_value.bind(this))
    };

    this.reload_settings = function() {
        $('#setting').empty().val(null);
        $('#setting-value').val(null);
        current_indi_device().reload(this.__on_properties_reloaded.bind(this));
    };

    this.set_value = function() {
        var value = $('#setting-value').val();
        var property = $('#setting').val();
        $('#setting-value').val(null);
        current_indi_device().set(property, value, this.reload_value.bind(this))
    };


    this.onDisplay = function() {
        if(this.localsettings.getJSON('settings_page_first_run', true) == true ) {
            var firstRunCompleted = function(){
                this.localsettings.setJSON('settings_page_first_run', false);
            };
            var showSecondMessage = function() {
                notification('info', 'Welcome', 'In this page you can change settings on INDI devices.<br>Changing the device in the first combo will also set the currently active device for previews.<br>The refresh buttons will allow you to reload devices, properties, and values, directly from the running INDI server.', {on_closed: firstRunCompleted.bind(this) });
            };
            notification('info', 'Welcome', 'This is the INDI CCD Preview application.', {on_closed: showSecondMessage.bind(this) });
        };
    };

    this.__on_property_value = function(property, device) {
        $('#setting-value').val(property['value']);
    };

    this.current_property = function() {
        return $('#setting').val();
    };



    this.__on_properties_reloaded = function(device) {
        $('#setting-value').val(null);
        device.properties.forEach( function(property) {
            var setting = property['property'] + '.' + property['element'];
            $('#setting').append($('<option />').val(setting).text(setting) );
        } );
        device.get(this.current_property(), this.__on_property_value.bind(this));
    };


    this.__on_devices_reloaded = function() {
        $('#setting').empty().val(null);
        $('#setting-value').val(null);
        this.indi.device_names().forEach( function(name) {
            $('#device').append($('<option />').val(name).text(name));
        });
        var current_device = current_indi_device(); // TODO
        $('#device').val(current_device.name);
        this.__on_properties_reloaded(current_device);
    };



    $('#refresh-devices').click(this.reload_devices.bind(this));
    $('#refresh-settings').click(this.reload_settings.bind(this));
    $('#reset-value').click(this.reload_value.bind(this));
    $('#set-value').click(this.set_value.bind(this));
    $('#device').change(function() {
        this.localsettings.set(SettingsPage.SETTING_DEVICE, $('#device').val());
        this.reload_settings();
    }.bind(this));
    $('#setting').change(this.reload_value.bind(this));
   
};
