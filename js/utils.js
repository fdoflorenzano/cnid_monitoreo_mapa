const perp = (p1, p2, d) => {
    const diff = {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
    const perp = {
        x: -1 * diff.y,
        y: diff.x
    };
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
        const generated_path = d3.select('svg').append('path').attr('d', p(object)).remove();
        const length = generated_path.node().getTotalLength();
        const midpoint = generated_path.node().getPointAtLength(length / 2);
        const almost_midpoint = generated_path.node().getPointAtLength(length * 0.45);
        const direction = perp(midpoint, almost_midpoint, d.origen > d.destino);
        const altered_path = {
            type: "LineString",
            coordinates: [
                [coor[d.origen].long, coor[d.origen].lat],
                proj.invert([midpoint.x + direction.x * length / 20, midpoint.y + direction.y * length / 20]), [coor[d.destino].long, coor[d.destino].lat]
            ]
        };
        // console.log(p(altered_path).replace(/M|Z/, "").split("L").map((d) =>  d.split(",")));
        return p(altered_path).replace(/M|Z/, "").split("L").map((d) => d.split(","));

    }
    return pathGenerator;
}

const gradientGeneratorConst = (projection, path, coordinates) => {
    const proj = projection;
    const p = path;
    const coor = coordinates;
    const gradientGenerator = (defs, d, i) => {
        const object = {
            type: "LineString",
            coordinates: [
                [coor[d.origen].long, coor[d.origen].lat],
                [coor[d.destino].long, coor[d.destino].lat]
            ]
        };
        const generated_path = d3.select('svg').append('path').attr('d', p(object)).remove();
        const length = generated_path.node().getTotalLength();
        const midpoint = generated_path.node().getPointAtLength(length / 2);
        const almost_midpoint = generated_path.node().getPointAtLength(length * 0.45);
        let diff = {
            x: midpoint.x - almost_midpoint.x,
            y: midpoint.y - almost_midpoint.y
        };
        const ratio = 100 / Math.max(Math.abs(diff.x), Math.abs(diff.y));
        diff.x *= ratio;
        diff.y *= ratio;
        const linearGradient = defs.append("linearGradient")
            .attr("id", "animate-gradient-" + i) //unique id to reference the gradient by
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", `${diff.x}%`)
            .attr("y2", `${diff.y}%`)
            .attr("spreadMethod", "reflect");

        // linearGradient.append("animate")
        //     .attr("attributeName", "x1")
        //     .attr("values", `0%;${diff.x}%`)
        //     .attr("dur", "3s")
        //     .attr("repeatCount", "indefinite");

        // linearGradient.append("animate")
        //     .attr("attributeName", "x2")
        //     .attr("values", `${diff.x}%;${2*diff.x}%`)
        //     .attr("dur", "3s")
        //     .attr("repeatCount", "indefinite");
        // linearGradient.append("animate")
        //     .attr("attributeName", "y1")
        //     .attr("values", `0%;${diff.y}%`)
        //     .attr("dur", "3s")
        //     .attr("repeatCount", "indefinite");

        // linearGradient.append("animate")
        //     .attr("attributeName", "y2")
        //     .attr("values", `${diff.y}%;${2*diff.y}%`)
        //     .attr("dur", "3s")
        //     .attr("repeatCount", "indefinite");
        return linearGradient;

    }
    return gradientGenerator;
}