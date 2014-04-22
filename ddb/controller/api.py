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

import requests as rq
from pyramid.view import view_config, view_defaults
from pyramid.httpexceptions import HTTPError, HTTPBadRequest, HTTPClientError
from ddb.models.base import DBSession
from ddb.models.pois import Poi
from ddb.controller import CommonController
from ddb.controller.cluster import Cluster

from geoalchemy2.elements import WKTElement
import geoalchemy2.functions as gfunc


def api_include(config):
    """
    Defining all routes implemented by this controller for inclusion in the app config

    - api_search
    - api_get_item
    """
    config.add_route('api_search','/search')
    config.add_route('api_get_item_ajax', '/item')
    config.add_route('api_get_item', '/item/{itemid}')
    config.add_route('api_get_item_method', '/item/{itemid}/{method}')

class ApiController(CommonController):
    """
    Controller Class
    Providing internal API to respond to AJAX calls from the map application
    """

    def _api_search(self, query, rows=None, offset=None):
        """
        Internal function.
        Fetching search results from the DDB API.
        This method should be used as a base by all API calls against the /search/ route

        Arguments:
            - query
                - Type: String
                - mandatory
                - Description: It's the search term
            - rows
                - Type: Integer
                - optional
                - Description: limits result items, combine with offset for paging

            - offset
                - Type: Integer
                - optional
                - Description: offset for result items, combine with limit for paging


        Returns the request object for further modification
        """

        #Preparing the url and the search route of the API
        url = self.request.registry.settings['api_url'] + '/search/'

        #Preparing the http headers for the request
        headers = {
            'content-type': 'application/json'
        }

        #Preparing the query parameters, getting the actual query string from the matchdict
        #Hardcoded facet values are for demonstration purposes only
        search_payload = {
            'oauth_consumer_key':self.request.registry.settings['oauth_key'],
            'facet':'provider_fct', #hardcoded
            'provider_fct':u'Landesamt für Denkmalpflege Hessen', #hardcoded
            'query': query
        }

        #Prepare for paging
        if rows:
            search_payload['rows'] = rows
        if offset:
            search_payload['offset'] = offset

        #Making the request against the DDB API
        r = rq.get(url, headers=headers, params=search_payload)

        return r

    def _cluster(self, bbox, resolution, radius, ids):
        """
        Internal function.
        Clusters the found POIs for map display depending on their distance to each other
        Internal help method

        Arguments:
            - bbox
                - Type: dict
                - mandatory
                - Description: Limits the result list of POIs depending on their location

            - resolution
                - Type: float
                - mandatory
                - Description:

            - radius
                - Type: Integer
                - mandatory
                - Description: Defines the distance between objects that will be clustered

            - ids
                - Type: dict
                    - Key: DDB ID of the object
                    - Value: Title attribute of the object, based on the DDB database entry.
                - mandatory
                - Description: Dict of all DDB ID's and their titles, that should be included in the result. Usually based on a returned DDB API search call.



        Returns the request object for further modification
        """
        #Creating the BBOX for postgis filtering
        bounding_line = WKTElement('LINESTRING(%(min_x)s %(min_y)s, %(max_x)s %(max_y)s)' % bbox, srid="3857")
        clusters = []

        #Prepare the query
        filtered_pois = DBSession.query(Poi.ddbid, Poi.ogc_fid, Poi.geom_3857.ST_X(), Poi.geom_3857.ST_Y())\
            .filter(Poi.geom_3857.intersects(gfunc.ST_Envelope(bounding_line)))\
            .filter(Poi.ddbid.in_(ids.keys())).order_by(Poi.ddbid)

        #Add a filter
        if not (self.request.GET.getone('filtercheckbox') == u'true'):
            #Getting all objects within the BBOX that are listed in ids filtered by filterparams
            filters = self.request.GET.getone('filterdatum').split(' ')
            filtered_pois = filtered_pois.filter(Poi.year.between(filters[0],filters[2]))

        #Do the query
        filtered_pois = filtered_pois.all()

        #Cluster the result depending on radius
        for poi in filtered_pois:
            clustered = False
            for j in range(len(clusters)-1, -1, -1):
                cluster = clusters[j]
                if cluster.should_cluster(poi, radius):
                    cluster.add(poi, ids)
                    clustered = True
                    break
            if not clustered:
                clusters.append(Cluster(poi, resolution, ids))
        return clusters


    def _api_get_item(self, contenttype='json', method='aip'):
        """
        Internal function.
        Fetches requested item from the DDB API.
        This method should be used as a base by all API calls against the /items/ route

        Arguments:
            - contenttype
                - Type: String
                - Possible values: json, xml
                - Default: json
                - Description: sets the contenttype for the API call
            - method
                - Type: String
                - Possible values: aip, binaries, children, edm, indexing-profile, parents, source, view
                - Default: aip
                - Description: sets the method for the API call, altering the result type

        Returns the request object for further modification
        """

        #Preparing the http headers for the request
        headers = {
            'content-type': 'application/%s' % contenttype
        }

        #Preparing the Query url including the path parameters from the matchdict
        url = self.request.registry.settings['api_url'] + '/items/%s/%s' % (self.request.matchdict['itemid'], method)

        #Preparing the query parameters
        itempayload = {
            'oauth_consumer_key':self.request.registry.settings['oauth_key'],
        }

        #Make the request
        r = rq.get(url, headers=headers, params=itempayload)

        return r


    @view_config(route_name='api_search', renderer="prettyjson", request_method="GET", request_param="format=json")
    def api_search_json(self):
        """
        View code

        Performs search request to the DDB API.
        Returns the result in JSON

        Requires:
            - HTTP-GET request
            - HTTP-GET parameter format set to 'json'

        Returns:
            - JSON (pretty printed)

        Raises:
            - HttpError
        """
        try:
            params= {}
            params['query'] = self.request.GET['query']
            bbox = self.request.GET['bbox'].split(",")
            bbox = dict(min_y=bbox[1], min_x =bbox[0], max_y = bbox[3], max_x =bbox[2])

            resolution = float(self.request.GET['resolution']) #611.4962261962891
            radius = 40

            request = self._api_search(**params)
            if request and request.ok:

                jresult= request.json()["results"][0]["docs"]
                dict_of_ids = {}
                for d in jresult:
                    dict_of_ids[d['id']] = d['title']
                clusters = self._cluster(bbox=bbox, resolution=resolution, radius=radius, ids=dict_of_ids)
                result = dict(type="FeatureCollection", features= [c.__json__() for c in clusters])
                return result
            else:
                raise HTTPError("Request failed")
        except Exception, e:
            raise HTTPError("Request failed")


    @view_config(route_name='api_search', renderer="../templates/api_search.pt", request_method="GET", request_param="format=html")
    def api_search_html(self):
        """
        View code

        Performs search request to the DDB API.
        Returns the result as HTML

        Requires:
            - HTTP-GET request
            - HTTP-GET parameter format set to 'html'

        Returns:
            - HTML

        Raises:
            - HttpError
        """
        try:
            params= {}
            params['query'] = self.request.GET['query']
            bbox = self.request.GET['bbox'].split(",")
            bbox = dict(min_y=bbox[1], min_x =bbox[0], max_y = bbox[3], max_x =bbox[2])

            resolution = float(self.request.GET['resolution']) #611.4962261962891
            radius = 20

            request = self._api_search(**params)
            if request and request.ok:
                jresult= request.json()["results"][0]["docs"]
                dict_of_ids = {}
                for d in jresult:
                    dict_of_ids[d['id']] = d['title']

                clusters = self._cluster(bbox=bbox, resolution=resolution, radius=radius, ids=dict_of_ids)
                result = dict(type="FeatureCollection", features= [c.__json__() for c in clusters])
                return result
            else:
                raise HTTPError("Request failed")
        except Exception, e:
            raise HTTPClientError("Request failed")

    @view_config(route_name='api_get_item', renderer="../templates/api_get_item.pt", request_method="GET", request_param="format=html")
    @view_config(route_name='api_get_item_ajax', renderer="../templates/api_get_item.pt", request_method="GET", request_param="format=html")
    def api_get_item_html(self):
        """
        View code

        Performs item request to the DDB API.
        Returns the result as HTML

        Requires:
            - HTTP-GET request
            - HTTP-GET parameter format set to 'html'

        Returns:
            - HTML

        Raises:
            - HttpError
        """
        if self.request.matched_route.name == 'api_get_item_ajax':
            self.request.matchdict['itemid'] = self.request.GET.getone('itemid')

        request = self._api_get_item()
        if request and request.ok:
            jcontent = request.json()
            item = jcontent['view']['item']
            item['id'] = self.request.matchdict['itemid']
            if jcontent['preview']['thumbnail']:
                thumbnail = jcontent['preview']['thumbnail'].get('@href', None)
            else:
                thumbnail = None
            return dict(item=item, thumbnail=thumbnail)
        else:
            raise HTTPError("Request failed")

    @view_config(route_name='api_get_item_method', renderer='prettyjson', request_method="GET", request_param="format=json")
    @view_config(route_name='api_get_item', renderer="prettyjson", request_method="GET", request_param="format=json")
    def api_get_item_json(self):
        """
        View code

        Performs item request to the DDB API.
        Returns the result as HTML

        Requires:
            - HTTP-GET request
            - HTTP-GET parameter format set to 'json'

        Returns:
            - JSON

        Raises:

        """
        request = self._api_get_item()
        if request.ok:
            return request.json()
        else:
            return {}
