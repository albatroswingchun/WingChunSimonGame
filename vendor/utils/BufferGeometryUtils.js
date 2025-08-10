import { TrianglesDrawMode, TriangleFanDrawMode, TriangleStripDrawMode } from 'three';

function toTrianglesDrawMode( geometry, drawMode ) {

    if ( drawMode === TrianglesDrawMode ) {

        console.warn( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.' );
        return geometry;

    }

    if ( drawMode !== TriangleFanDrawMode && drawMode !== TriangleStripDrawMode ) {

        console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:', drawMode );
        return geometry;

    }

    const isFan = drawMode === TriangleFanDrawMode;

    let index = geometry.getIndex();
    const position = geometry.getAttribute( 'position' );
    const indices = [];

    if ( index !== null ) {

        const array = index.array;

        if ( isFan ) {

            const a = array[ 0 ];
            for ( let i = 1; i < array.length - 1; i ++ ) {
                indices.push( a, array[ i ], array[ i + 1 ] );
            }

        } else {

            for ( let i = 0; i < array.length - 2; i ++ ) {
                if ( i % 2 === 0 ) {
                    indices.push( array[ i ], array[ i + 1 ], array[ i + 2 ] );
                } else {
                    indices.push( array[ i ], array[ i + 2 ], array[ i + 1 ] );
                }
            }

        }

    } else if ( position !== undefined ) {

        if ( isFan ) {

            for ( let i = 1; i < position.count - 1; i ++ ) {
                indices.push( 0, i, i + 1 );
            }

        } else {

            for ( let i = 0; i < position.count - 2; i ++ ) {
                if ( i % 2 === 0 ) {
                    indices.push( i, i + 1, i + 2 );
                } else {
                    indices.push( i, i + 2, i + 1 );
                }
            }

        }

    } else {

        console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry does not have an index or position attribute.' );
        return geometry;

    }

    geometry.setIndex( indices );
    geometry.setDrawMode( TrianglesDrawMode );

    return geometry;

}

export { toTrianglesDrawMode };
