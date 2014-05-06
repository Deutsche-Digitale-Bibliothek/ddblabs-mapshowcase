# encoding=utf8

# Copyright 2014 in medias res Gesellschaft fuer Informationstechnologie mbH
# The ddb project licenses this file to you under the Apache License,
# version 2.0 (the "License"); you may not use this file except in compliance
# with the License. You may obtain a copy of the License at:
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

from pyramid.view import view_config, view_defaults
from pyramid.httpexceptions import HTTPFound
def map_include(config):
    """
    Defining all routes implemented by this controller for inclusion in the app config

    - map
    - map_dev
    """
    config.add_route('map', '/')
    config.add_route('map_dev', '/dev')
    config.add_route('map_mobile', '/mobile')

@view_config(route_name='map', renderer="ddb:templates/dev.pt")
@view_config(route_name='map_dev', renderer="ddb:templates/dev.pt")
def showmap(context, request):
    """
    Default initial route for map display.

    It renders the linked template with no further options supplied.
    """
    if request.session['browserdetection'] == 'mobile':
        return HTTPFound(location=request.route_url('map_mobile'))
    return {}

@view_config(route_name='map_mobile', renderer="ddb:templates/mobile.pt")
def showmobilemap(context, request):
    """
    Testroute for mobile map display

    It renders the linked template with no further options supplied.
    """

    return {}
