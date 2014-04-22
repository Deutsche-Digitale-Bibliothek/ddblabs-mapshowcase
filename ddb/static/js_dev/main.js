<!--
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
-->

function main() {
    initialize_map();
    initialize_panel();
    var overview_show = '<li class="ui-state-default ui-corner-all" title="show overview map" style="list-style-type:none;"><span class="ui-icon ui-icon-circle-arrow-w"></span></li>';
    var overview_hide = '<li class="ui-state-default ui-corner-all" title="hide overview map" style="list-style-type:none;"><span class="ui-icon ui-icon-circle-arrow-e"></span></li>';
    $("#overview").show();
    $("#overview_switch").html(overview_hide);
    $("#overview_switch").css({
        'right' : '246px'
    }).show();
     $("#overview_switch").click(function() {
                $("#overview_switch").hide();
                $("#overview").toggle("slide", {
                        direction : 'right'
                }, 400, function() {
                        // Animation complete.
                        if ($("#overview").css("display") != "none") {
                                $("#overview_switch").html(overview_hide);
                                $("#overview_switch").css({
                                        'right' : '246px'
                                }).show();
                        } else {
                                $("#overview_switch").html(overview_show);
                                $("#overview_switch").css({
                                        'right' : '0px'
                                }).show();
                        }
                });
        });
     $('.button').button();
}
$(main)
