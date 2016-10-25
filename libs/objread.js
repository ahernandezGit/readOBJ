function readOBJ(text){
        var lines = text.match(/[^\r\n]+/g);
        var vertices = [];
        var verticesNormals = [];    
        var faces = [];
        for(var i=0; i < lines.length; ++i) {
            var line = lines[i];
            if(line[0] === "v" && line[1] !== "n") {
                var coords = line.match(/[e\d.-]+/g);
                for(var j=0; j < coords.length; ++j) {
                    coords[j] = parseFloat(coords[j]);
                }
                vertices.push(new THREE.Vector3(coords[0], coords[1], coords[2]));
            }
            else if(line[0] === "v" && line[1] === "n"){
                //console.log(line);
                var coords = line.match(/[e\d.-]+/g);
                //console.log(coords);
                for(var j=0; j < coords.length; ++j) {
                    coords[j] = parseFloat(coords[j]);
                }
                verticesNormals.push(new THREE.Vector3(coords[0], coords[1], coords[2]));
            }
            else if(line[0] === "f") {
                var indices = line.match(/[\d.]+/g);
                for(var j=0; j < indices.length; ++j) {
                    indices[j] = parseInt(indices[j])-1;
                }
                faces.push(indices);
            }
        }
        /*for(var i=0;i<verticesNormals.length;i++){
            var final=vertices[i].clone().add(verticesNormals[i]);
            verticesNormals[i].copy(final);
        }*/
        return [vertices,verticesNormals,faces];
}
function loadFileAsText(){
	var fileToLoad = document.getElementById("fileToLoad").files[0];
	var fileReader = new FileReader();
    var text="";
	fileReader.onload = function(fileLoadedEvent) 
	{
        text = String(fileReader.result);
        for( var i = setup.scene.children.length - 1; i >= 0; i--) { 
             var  obj = setup.scene.children[i];
             setup.scene.remove(obj);
        }
        var data=readOBJ(text);
        var pointsGeometry=new THREE.Geometry();
        var normalsGeometry=new THREE.Geometry();
        var pointmaterial = new THREE.PointsMaterial( {color: 0x27B327, size: 5.0, sizeAttenuation: false, alphaTest: 0.5 } );
        var linematerial = new THREE.LineBasicMaterial( { color: 0x0000FF, linewidth: 1 } );
        pointsGeometry.vertices=data[0];
        var center=pointsGeometry.center();
        for(var i=0;i<pointsGeometry.vertices.length;i++){
            pointsGeometry.vertices[i].sub(center);
        }
        pointsGeometry.normalize();
        var particles = new THREE.Points( pointsGeometry, pointmaterial );
        particles.name="Points";
        particles.position.set( 0, 0, 0 );
        setup.scene.add( particles );
        console.log("vertices: ",pointsGeometry.vertices.length); 
        
        if(data[1].length>0){
            for(var i=0;i<data[1].length;i++){
                data[1][i].normalize();
                data[1][i].divideScalar(10);
                var final=pointsGeometry.vertices[i].clone().add(data[1][i]);
                normalsGeometry.vertices.push(pointsGeometry.vertices[i],final);
            }
            var normals=new THREE.LineSegments(normalsGeometry, linematerial);
            setup.scene.add( normals );
        }
        else{
            console.log("sem normals");
        }
        
        /*console.log(data);
        if(data[2].length>0){
            var geo = new THREE.Geometry();
            console.log(geo.faces);
            geo.vertices=data[0];
            geo.faces=data[2];
            var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
                color:  0xd9d9d9,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                side:  THREE.DoubleSide, 
                vertexColors: THREE.FaceColors,
                polygonOffsetUnits: 0.1,
                opacity: 1,
                transparent: true
            }));
            setup.scene.add(mesh);   
        }*/

    };
    fileReader.readAsText(fileToLoad);
}
function updatePointSize(value){
    var points=setup.scene.getObjectByName("Points");
    console.log(value);
    if(points!=undefined) {
        points.material.size=value;
    }
}
function onKeyDown(){
    var event=d3.event;
    var obj=setup.scene.getObjectByName("Points");
    //letter d
    if(event.keyCode == 68){    
        obj.material.size++;
    }
    //letter s
    if(event.keyCode == 83){
       if(obj.material.size>1)  obj.material.size--;
    }
}
d3.select("#fileToLoad").on("change",loadFileAsText);
var bodywindows=d3.select("body");
bodywindows.on("keydown",onKeyDown);