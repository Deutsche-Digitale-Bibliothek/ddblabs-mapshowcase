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

from pyramid.events import subscriber
from pyramid.events import ContextFound

from httpagentparser import detect

class CommonController(object):
    def __init__(self, context, request):
        self.request = request
        self.context = context
        self.session = request.session


@subscriber(ContextFound)
def browser_detection(event):
    if not(event.request.session.has_key('browserdetection')) or event.request.session.get('browserdetection') == None:
        browser = detect(event.request.user_agent, fill_none=True)
        try:
            if browser['platform']['name'] in ['iOS', 'BlackBerry', 'Android']:
                event.request.session['browserdetection'] = 'mobile'
            else:
                event.request.session['browserdetection'] = 'normal'
        except KeyError:
            event.request.session['browserdetection'] = 'normal'
