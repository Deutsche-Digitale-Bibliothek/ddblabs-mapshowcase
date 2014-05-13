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

import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.md')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid==1.4.5',
    'SQLAlchemy',
    'transaction',
    'pyramid_tm',
    'zope.sqlalchemy',
    'waitress',
    'psycopg2',
    'requests',
    'httpagentparser',
    'pyramid_beaker',
    'geoalchemy2',
    'sphinx'
    ]

setup(name='ddb',
      version='0.4',
      description='ddb map showcase',
      long_description=README + '\n\n' + CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='in medias res GmbH',
      author_email='info@webgis.de',
      url='http://www.webgis.de',
      keywords='web wsgi bfg pylons pyramid',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      test_suite='ddb',
      install_requires=requires,
      entry_points="""\
      [paste.app_factory]
      main = ddb:main
      [console_scripts]
      initialize_ddb_db = ddb.scripts.initializedb:main
      """,
      )
