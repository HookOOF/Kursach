

export class Shape {
    constructor(location, color) {
        this.color = color;
        this.location = location;
        this.svgComponent = null;
    }

    // Абстрактный метод (в JavaScript нужно выбрасывать ошибку)
    svgAppender(selection) {
        throw new Error("svgAppender must be implemented in subclasses");
    }
}

export class PathShape extends Shape {
    constructor(path, color) {
        super(new Point(0, 0), color);
        this.path = path;
    }

    svgAppender(selection) {
        this.svgComponent = selection.append("path")
            .attr("d", this.path)
            .attr("x", this.location.x)
            .attr("y", this.location.y)
            .style("fill", this.color)
            .style("cursor", "pointer");
    }
}

export class Rectangle extends Shape {
    constructor(location, width, height, color) {
        super(location, color);
        this.width = width;
        this.height = height;
    }

    svgAppender(selection) {
        this.svgComponent = selection.append("rect")
            .attr("x", this.location.x)
            .attr("y", this.location.y)
            .attr("width", this.width)
            .attr("height", this.height)
            .style("fill", this.color)
            .style("cursor", "pointer");
    }
}

export class Circle extends Shape {
    constructor(location, radius, color, outerShape = false) {
        super(location, color);
        this.radius = radius;
        this.outerShape = outerShape;
    }

    svgAppender(selection) {
        this.svgComponent = selection.append("circle")
            .attr("cx", this.location.x)
            .attr("cy", this.location.y)
            .attr("r", this.radius)
            .style("fill", this.color)
            .style("cursor", "pointer");

        if (this.outerShape) {
            this.svgComponent.attr("class", "outerShape");
        }
    }
}

export class Line extends Shape {
    constructor(location, endPoint, lineWidth, color) {
        super(location, color);
        this.endPoint = endPoint;
        this.lineWidth = lineWidth;
    }

    svgAppender(selection) {
        this.svgComponent = selection.append("line")
            .attr("x1", this.location.x)
            .attr("y1", this.location.y)
            .attr("x2", this.endPoint.x)
            .attr("y2", this.endPoint.y)
            .style("stroke-width", this.lineWidth)
            .style("stroke", this.color)
            .style("cursor", "pointer");
    }
}

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static randomPoint(width, height, initial) {
        return new Point(Math.random() * width + initial.x, Math.random() * height + initial.y);
    }

    distance(other) {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }

    add(other) {
        return new Point(this.x + other.x, this.y + other.y);
    }

    minus(other) {
        return new Point(this.x - other.x, this.y - other.y);
    }

    angleTo(other) {
        return Math.atan2(other.y - this.y, other.x - this.x) * 180 / Math.PI;
    }

    midpoint(other) {
        return new Point((this.x + other.x) / 2, (this.y + other.y) / 2);
    }
}
