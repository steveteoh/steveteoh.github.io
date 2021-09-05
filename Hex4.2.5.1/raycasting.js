function pointInPolygon(polygonPath, coordinates) {
        let numberOfVertexs = polygonPath.length - 1;
        let inPoly = false;
        let { lat, lng } = coordinates;

        let lastVertex = polygonPath[numberOfVertexs];
        let vertex1, vertex2;

        let x = lat, y = lng;

        let inside = false;
        for (var i = 0, j = polygonPath.length - 1; i < polygonPath.length; j = i++) {
            let xi = polygonPath[i].lat, yi = polygonPath[i].lng;
            let xj = polygonPath[j].lat, yj = polygonPath[j].lng;

            let intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }