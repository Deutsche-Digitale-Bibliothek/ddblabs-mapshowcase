/*
// Copyright 2014 in medias res Gesellschaft fuer Informationstechnologie mbH
// The ddb project licenses this file to you under the Apache License,
// version 2.0 (the "License"); you may not use this file except in compliance
// with the License. You may obtain a copy of the License at:
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
*/

function initialize_panel() {

    $("#tabs").tabs({
    });
    $(".accordion").accordion({
        collapsible : true,
        heightStyle : "content",
        active : 0,
    });
    $(".ui-widget-content").css({
        'background' : 'white',
    });


    $("#panel_switch").click(function() {
        $("#panel_switch").hide();
        $("#panel").toggle("slide", 400, function() {
            // Animation complete.
            if ($("#panel").css("display") != "none") {
                $("#panel_switch").html(panel_hide);
                $("#panel_switch").css({
                    'left' : '310px'
                }).show();
            } else {
                $("#panel_switch").html(panel_show);
                $("#panel_switch").css({
                   'left' : '0px'
                }).show();
            }
        });
    });

    var panel_show = '<li class="ui-state-default ui-corner-all" title="show panel" style="list-style-type:none;"><span class="ui-icon ui-icon-circle-arrow-e"></span></li>';
    var panel_hide = '<li class="ui-state-default ui-corner-all" title="hide panel" style="list-style-type:none;"><span class="ui-icon ui-icon-circle-arrow-w"></span></li>';

    $("#panel").show(); // Panel Initial open
    $("#panel_switch").html(panel_hide);
    $("#panel_switch").css({
        'left' : '310px'
    }).show();


    $("#toogle-osm-mapnick").prop('checked', true).on('click', function() {
        if ($(this).is(':checked')) {
            DDB.osm.setVisibility(true);
            DDB.osmworld.setVisibility(false);
            $("#toogle-osm-worldwide").prop('checked', false);

        } else {
            DDB.osm.setVisibility(false);
            DDB.osmworld.setVisibility(true);
            $("#toogle-osm-worldwide").prop('checked', true);
        }
    });

    $("#toogle-osm-worldwide").prop('checked', false).on('click', function() {
        if ($(this).is(':checked')) {
            DDB.osmworld.setVisibility(true);
            DDB.osm.setVisibility(false);
            $("#toogle-osm-mapnick").prop('checked', false)
        } else {
            DDB.osm.setVisibility(true);
            DDB.osmworld.setVisibility(false);
            $("#toogle-osm-mapnick").prop('checked', true)
        }
    });

    $("#toogle-osm-hillshade").prop('checked', false).on('click', function() {
        if ($(this).is(':checked')) {
            DDB.hillshade.setVisibility(true);
        } else {
            DDB.hillshade.setVisibility(false);
        }
    });



}
