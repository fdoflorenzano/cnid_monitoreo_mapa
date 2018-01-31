const perp = (p1, p2, d) => {
    const diff = {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
    const perp = {
        x: (d ? 1 : -1) * diff.y,
        y: (d ? -1 : 1) * diff.x
    };
    console.log(perp)
    const length = Math.sqrt(Math.pow(perp.x, 2) + Math.pow(perp.y, 2));
    return {
        x: perp.x / length,
        y: perp.y / length,
    }
}

const pathGeneratorConst = (projection, path, coordinates) => {
    const proj = projection;
    const p = path;
    const coor = coordinates;
    const pathGenerator = (d) => {
        const object = {
            type: "LineString",
            coordinates: [
                [coor[d.origen].long, coor[d.origen].lat],
                [coor[d.destino].long, coor[d.destino].lat]
            ]
        };
        console.log(d.origen, d.destino)
        const generated_path = d3.select('svg').append('path').attr('d', p(object)).remove();
        const length = generated_path.node().getTotalLength();
        const midpoint = generated_path.node().getPointAtLength(length / 2);
        const almost_midpoint = generated_path.node().getPointAtLength(length * 0.45);
        const direction = perp(midpoint, almost_midpoint, d.origen > d.destino);
        const altered_path = {
            type: "LineString",
            coordinates: [
                [coor[d.origen].long, coor[d.origen].lat],
                proj.invert([midpoint.x + direction.x * length / 20, midpoint.y + direction.y * length / 20]), 
                [coor[d.destino].long, coor[d.destino].lat]
            ]
        };
        // console.log(p(altered_path).replace(/M|Z/, "").split("L").map((d) =>  d.split(",")));
        return p(altered_path).replace(/M|Z/, "").split("L").map((d) => d.split(","));

    }
    return pathGenerator;
}