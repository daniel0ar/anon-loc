fn is_crossing(
    point: (Field, Field),
    a: (Field, Field),
    b: (Field, Field)
) -> bool {
    let (a_y, b_y, a_x, b_x) = if a.1 <= b.1 {
        (a.1, b.1, a.0, b.0)
    } else {
        (b.1, a.1, b.0, a.0)
    };

    let (px, py) = point;

    let y_between = py >= a_y && py < b_y;
    let det = (px - a_x) * (b_y - a_y);
    let threshold = (b_x - a_x) * (py - a_y);

    let crosses = det < threshold;
    return y_between && crosses;
}

pub fn main(
    point: (Field, Field),
    polygon: [(Field, Field); 4]
) -> bool {
    let mut count = 0;

    for i in 0..4 {
        let j = if i + 1 == 4 { 0 } else { i + 1 };
        let cross = is_crossing(point, polygon[i], polygon[j]);
        count += if cross { 1 } else { 0 };
    }

    return count % 2 == 1;
}