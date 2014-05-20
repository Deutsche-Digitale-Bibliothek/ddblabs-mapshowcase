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

import math

class Cluster(object):
    """
    Bundles the clustering of the points found.

    """
    def __init__(self, row, resolution, ids):
        self.cc = (row[2],row[3])
        self.ids = [(row[0], ids.get(row[0]))]
        self.resolution = resolution

    def should_cluster(self, row, distance):
        """
        Determines if the points should be clustered in this cluster
        """
        cc = self.cc;
        fc = (row[2],row[3])
        d =  math.sqrt(
                (cc[0] - fc[0])*(cc[0] - fc[0]) + (cc[1] - fc[1])*(cc[1] - fc[1])
            ) / self.resolution
        return (d <= distance);

    def add(self, row, ids):
        """
        Adds a point to the cluster
        """
        self.ids.append((row[0],ids.get(row[0])))

    def __json__(self):
        """
        Returns the cluster as GeoJSON
        """
        return dict(
            type="Feature",
            geometry= dict(
                type = "Point",
                coordinates=self.cc
            ),
            properties = dict(
                cluster = True,
                ids = self.ids,
                count = len(self.ids)
            )
        )
