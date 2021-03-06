var used_uuids = {};
var Soopfw = {

};

var $i = 1;
var PDT_INT = $i++;
var PDT_FLOAT = $i++;
var PDT_STRING = $i++;
var PDT_DECIMAL = $i++;
var PDT_DATE = $i++;
var PDT_OBJ = $i++;
var PDT_ARR = $i++;
var PDT_BOOL = $i++;
var PDT_INET = $i++;
var PDT_SQLSTRING = $i++;
var PDT_JSON = $i++;
var PDT_PASSWORD = $i++;
var PDT_ENUM = $i++;
var PDT_TEXT = $i++;
var PDT_TINYINT = $i++;
var PDT_MEDIUMINT = $i++;
var PDT_BIGINT = $i++;
var PDT_SMALLINT = $i++;
var PDT_DATETIME = $i++;
var PDT_TIME = $i++;
var PDT_FILE = $i++;
var PDT_LANGUAGE = $i++;
var PDT_LANGUAGE_ENABLED = $i++;
var PDT_SERIALIZED = $i++;
var PDT_BLOB = $i++;

var soopfw_ajax_queue = {};
$.extend(Soopfw, {
	behaviors: [],
	system_prio_behaviors: [],
	prio_behaviors: [],
	tab_behaviors: {},
	late_behaviors: [],
	current_tab: '',
	already_loaded_files: {},
	internal: {
		progressbars: {}
	},

	/**
	 * Holds all bindings for a specified tab.
	 */
	tab_bindings: {},
	
	/**
	 * Add a tab 
	 * 
	 * @param {string} tab
	 *   The tab id.
	 */
	add_tab: function(tab) {
		if (Soopfw.tab_bindings[tab] === undefined) {
			Soopfw.tab_bindings[tab] = {};
		}
		Soopfw.current_tab = tab;
	},
	
	/**
	 * Returns the size of the provided object.
	 * 
	 * @param {object} obj
	 *   The object to be counted.
	 *   
	 * @return int The object size.
	 */
	obj_size: function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	},

	/**
	 * Behavious all js function should implement this instead of Jquery document ready
	 * Will be reloaded with every ajax_html and normal page request
	 */
	reload_behaviors: function() {
		//Priority behaviours will be loaded first
		for(var behavior_a in Soopfw.system_prio_behaviors) {
			if(Soopfw.system_prio_behaviors.hasOwnProperty(behavior_a)) {
				if(jQuery.isFunction(Soopfw.system_prio_behaviors[behavior_a])) {
					Soopfw.system_prio_behaviors[behavior_a]();
				}
			}
		}
		//Priority behaviours will be loaded first
		for(var behavior_x in Soopfw.prio_behaviors) {
			if(Soopfw.prio_behaviors.hasOwnProperty(behavior_x)) {
				if(jQuery.isFunction(Soopfw.prio_behaviors[behavior_x])) {
					Soopfw.prio_behaviors[behavior_x]();
				}
			}
		}
		for(var behavior_i in Soopfw.behaviors) {
			if(Soopfw.behaviors.hasOwnProperty(behavior_i)) {
				if(jQuery.isFunction(Soopfw.behaviors[behavior_i])) {
					Soopfw.behaviors[behavior_i]();
				}
			}
		}
		
		for(var behavior_y in Soopfw.late_behaviors) {
			if(Soopfw.late_behaviors.hasOwnProperty(behavior_y)) {
				if(jQuery.isFunction(Soopfw.late_behaviors[behavior_y])) {
					Soopfw.late_behaviors[behavior_y]();
				}
			}
		}
		Soopfw.system_footer_behaviour();
	},

	/**
	 * Translation function, key as an english text, args as an object {search => replace}.
	 * 
	 * @param {string} key
	 *   The english key (text).
	 * @param {object} args
	 *   The arguments which will be replaced within the text.
	 */
	t: function(key, args) {
		
		var translation = key;
		if(args !== undefined) {
			foreach(args, function(k, v) {
				translation = str_replace(k, v, translation);
			});
		}
		return translation;
	},

	/**
	 * Redirects the user to the url what was configurated through 
	 * php within the redirect_url setting.
	 */
	redirect: function() {

		var url = Soopfw.config.redirect_url;
		if(!empty(url)) {
			Soopfw.location(url);
		}
	},
	
	reload: function() {
		document.location.reload();
	},

	/**
	 * Points the browser to the given url.
	 * 
	 * @param {string} url
	 *   The url
	 */
	location: function(url) {
		document.location.href = url;
	}
});

function murl($controller, $action, $data, $is_html) {
    var $url;
    if (phpminer.settings.docroot === '/') {
        $url = '/' + $controller;
        if ($action !== undefined && $action !== null) {
            $url += '/' + $action;
            
            if ($data !== undefined && $data !== null) {
                $url += '/' + $data;
            }
        }
        if (!$is_html) {
            $url += '.json';
        }
        return $url;
    }
    else {
        $url = phpminer.settings.docroot + '/index.php?controller=' + $controller;
        if ($action !== undefined && $action !== null) {
            $url += '&action=' + $action;
            
            if ($data !== undefined && $data !== null) {
                $url += '&data=' + $data;
            }
        }
        if (!$is_html) {
            $url += '&type=json';
        }
        return $url;
    }
}

Soopfw.system_footer_behaviour = function() {
        $('#save_cg_miner_config').off('click').on('click', function() {
            confirm("You are going to save the current changed values to cgminer config.\nAfter saving, when cgminer starts it will use the new settings.\n<b>Please make sure that your system runs stable with all overclocked settings.<b>", 'Warning', function() {
               ajax_request(murl('main', 'save_config'), null, function() {
                   success_alert('Config saved', function() {
                       $('#save_cg_miner_config_container').fadeOut('slow');
                   });
               }); 
            });
        });
        
        $('*[data-toggle="tooltip"]').tooltip();
        
        $('.slider_toggle').each(function(){
            if ($(this).val() === '') {
                $(this).val(0);
            }
            $(this).before($('<div></div>').noUiSlider({
                range: [$(this).data('min'), $(this).data('max')],
                start: $(this).val(),
                handles: 1,
                margin: 2,
                step: $(this).data('steps'),
                decimals: 1,
                serialization: {
                    to: [$(this), 'value'],
                    resolution: 1
                }
            }));
        }); 
};

$(document).ready(function() {
    Soopfw.reload_behaviors();
});

function add_rig_dialog(add, data) {
    
    var dialog = "";
    var title = '';
    
    if (data === undefined) {
        data = {};
    }
    
    if (add === undefined) {
        title = 'Setup';
    }
    else if (data.name !== undefined) {
        title = 'Edit rig <b>' + data.name + '</b>';
    }
    else {
       title  = 'Add a new rig'; 
    }
    
    dialog += '    Please provide the connection settings to your cgminer. <br />';
    dialog += '    You can find it within cgminer.conf <br />';
    dialog += '    Please make sure to enable api-listen and set "api-allow": "W:{YOUR_IP}" where <b>{YOUR_IP}</b> is the ip-address of the server which runs the main script of phpminer<br />';
    dialog += '    The port is written at <b>api-port</b> (default: 4028)<br />';
    dialog += '    <div class="simpleform">';
    dialog += '        <div class="form-element">';
    dialog += '            <label for="name">Rig name:</label>';
    dialog += '            <input type="text" name="name" id="name" value="' + ((data.name !== undefined) ? data.name : 'localhost') + '" style="position: absolute;margin-left: 210px;width: 300px;"/> ';
    dialog += '        </div>';
    dialog += '        <div class="form-element">';
    dialog += '            <label for="ip">CGminer API IP:</label>';
    dialog += '            <input type="text" name="ip" id="ip" value="' + ((data.ip !== undefined) ? data.ip : '127.0.0.1') + '" style="position: absolute;margin-left: 210px;width: 300px;"/> ';
    dialog += '        </div>';
    dialog += '        <div class="form-element">';
    dialog += '            <label for="port">CGminer API Port:</label>';
    dialog += '            <input type="text" name="port" id="port" value="' + ((data.port !== undefined) ? data.port : '4028') + '" style="position: absolute;margin-left: 210px;width: 300px;"/> ';
    dialog += '        </div>';
    dialog += '        <div>';
    dialog += '        Because PHPMiner can handle multiple mining rigs, it is required that at each mining rig the phpminer_rpcclient is running. It must run under the user where it can start cgminer';
    dialog += '        This is required in order to restart cgminer (linux + windows) or reboot machine (linux only) from the main system. A instructions how to set it up is found within README.md';
    dialog += '        </div>';
    dialog += '        <div class="form-element">';
    dialog += '            <label for="http_ip">PHPMiner RPC Host/IP:</label>';
    dialog += '            <input type="text" name="http_ip" id="http_ip" value="' + ((data.http_ip !== undefined) ? data.http_ip : '127.0.0.1') + '"  style="position: absolute;margin-left: 210px;width: 300px;"/> ';
    dialog += '        </div>';
    dialog += '        <div class="form-element">';
    dialog += '            <label for="http_port">PHPMiner RPC Port:</label>';
    dialog += '            <input type="text" name="http_port" id="http_port" value="' + ((data.http_port !== undefined) ? data.http_port : '11111') + '"  style="position: absolute;margin-left: 210px;width: 300px;"/> ';
    dialog += '        </div>';
    dialog += '        <div>';
    dialog += '        This key you have to configure in the index.php within the phpminer_rpcclient folder.';
    dialog += '        </div>';
    dialog += '        <div class="form-element">';
    dialog += '            <label for="rpc_key">PHPMiner RPC Key:</label>';
    dialog += '            <input type="text" name="rpc_key" id="rpc_key" value="' + ((data.rpc_key !== undefined) ? data.rpc_key : '') + '"  style="position: absolute;margin-left: 210px;width: 300px;"/> ';
    dialog += '        </div>';
    dialog += '    </div>';


    make_modal_dialog(title, dialog,
        [
            {
                title: 'Check connect',
                type: 'primary',
                id: 'setup_check_connection',
               /* data: {
                    "loading-text": 'Checking connection...'
                },*/
                click: function() {
                    var that = this;
                    ajax_request(murl('main', 'check_connection'), {
                        port: $('#port').val(),
                        ip: $('#ip').val(),
                        http_ip: $('#http_ip').val(),
                        http_port: $('#http_port').val(),
                        rpc_key: $('#rpc_key').val(),
                        name: $('#name').val(),
                        edit: (data.name !== undefined) ? data.name : false
                    }, function() {
                        Soopfw.reload();
                    }, function() {
                        $('#setup_check_connection').button('reset');
                    });
                }
            }
        ], {
        width: 660,
        keyboard: (add !== undefined),
        cancelable: (add !== undefined)
    });
    
}

function make_modal_dialog(title, html, buttons, options) {
    $('.modal').remove();
    
    var dialog_styles = '';
    if (options !== undefined) {
        if (options.width !== undefined) {
            dialog_styles += ' width:' + options.width + 'px;';
        }
    }
    
    if (dialog_styles !== '') {
        dialog_styles = ' style="' + dialog_styles + '"';
    }
    
    var dialog = "";
    dialog += '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
    dialog += ' <div class="modal-dialog"' + dialog_styles + '>';
    dialog += '     <div class="modal-content">';
    
    dialog += '         <div class="modal-header">';
    if (options.cancelable === undefined || options.cancelable !== false) {
        dialog += '             <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
    }
    dialog += '             <h4 class="modal-title" id="myModalLabel">' + title + '</h4>';
    dialog += '         </div>';
    
    dialog += '         <div class="modal-body">';
    
    dialog += '             <div class="dialog-content">';
    dialog += html;
    dialog += '             </div>';
    
    dialog += '         </div>';
    
    if (!empty(buttons)) {
        dialog += '         <div class="modal-footer">';
        
        foreach (buttons, function(key, value){
            if (value === 'close') {
                dialog += '             <button type="button" class="btn btn-default" data-dismiss="modal">Cancel/Close</button>';
            }
            else {
                
                var attributes = "";
                if (value.id !== undefined) {
                    attributes += ' id="' + value.id + '"';
                }
                if (!empty(value.data)) {
                    foreach (value.data, function(attribute, attribute_value) {
                        attributes += ' data-' + attribute + '="' + attribute_value + '"';
                    });
                }
                
                dialog += '             <button type="button" class="btn btn-' + value.type + '"' + attributes + '>' + value.title + '</button>';
            }
        });
        dialog += '         </div>';
    }
    
    dialog += '     </div>';
    dialog += ' </div>';
    dialog += '</div>';
    
    var dlg_options = $.extend({
        backdrop: false
    }, options);
    $(dialog).modal(dlg_options).on('shown.bs.modal', function(){
        if (!empty(buttons)) {
            foreach (buttons, function(key, value){
                if (value.data !== undefined && value.data['loading-text'] !== undefined) {
                    var old_click = function() {};
                    if (value.click !== undefined) {
                        old_click = value.click;
                    }
                    value.click = function() {
                        $(this).button('loading');
                        old_click();
                    };
                }
                if (value.click !== undefined) {
                    $('#' + value.id).on('click', value.click);
                }
            });
        }
        
        if (dlg_options.show !== undefined && dlg_options.show !== null) {
            dlg_options.show();
        }
    });
    return dialog;
}
