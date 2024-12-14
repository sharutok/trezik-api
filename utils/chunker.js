exports.Chunker = (data) => {
    // main array
    const arr = [...data];

    //count multiple
    const size = 3;
    let yyy = [];
    const remainder = Math.ceil(arr.length / size);

    const splitArray = [...Array.from(Array(remainder).keys())];
    let count = 0;
    splitArray.map((x, i) => {
            let a = size * i;
            let b = size * (i + 1);
            yyy.push(arr.slice(a, b) );
    });

    return yyy
}
