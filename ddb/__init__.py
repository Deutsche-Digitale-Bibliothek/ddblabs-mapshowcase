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

from pyramid.config import Configurator
#from pyramid.session import UnencryptedCookieSessionFactoryConfig
from pyramid_beaker import session_factory_from_settings
from pyramid.view import static_view
from pyramid.renderers import JSON
from sqlalchemy import engine_from_config
from ddb.controller.map import map_include
from ddb.controller.api import api_include

from .models import (
    DBSession,
    Base,
)

ddb_static_view = static_view('ddb:static', use_subpath=True)

def include_static(config):
    config.add_route("static", "/static/*subpath")
    config.add_view(ddb_static_view, route_name="static")


def main(global_config, **settings):
    """

    Returns Pyramid WSGI application.

    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    config = Configurator(settings=settings)
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_renderer('prettyjson', JSON(indent=4))
    config.include(include_static)
    config.include(map_include, route_prefix="")
    config.include(api_include, route_prefix="/api")
    config.scan('ddb:controller')

    session_factory = session_factory_from_settings(settings)
    config.set_session_factory(session_factory)

    return config.make_wsgi_app()
