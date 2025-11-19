const { MongoClient } = require('mongodb');

// IMPORTANTE: Copia aquí tu MONGODB_URI del .env.local (reemplaza la línea de abajo)
const MONGODB_URI = process.env.MONGODB_URI ;
const MONGODB_DB = 'notaria';

async function populateVacationDays() {
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI no está definido');
    console.log('\n📝 Instrucciones:');
    console.log('1. Abre este archivo: scripts/populate-vacation-days.js');
    console.log('2. En la línea 4, reemplaza el valor de MONGODB_URI con tu connection string');
    console.log('3. Guarda y ejecuta: node scripts/populate-vacation-days.js');
    process.exit(1);
  }

  console.log('🔄 Conectando a MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db(MONGODB_DB);
    const usuariosCollection = db.collection('usuarios');

    // Actualizar todos los usuarios que no tengan diasVacaciones
    const result = await usuariosCollection.updateMany(
      { diasVacaciones: { $exists: false } },
      { 
        $set: { 
          diasVacaciones: 20,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`✅ ${result.modifiedCount} usuarios actualizados con 20 días de vacaciones`);

    // Mostrar todos los usuarios
    const usuarios = await usuariosCollection.find({}).toArray();
    console.log('\n📋 Usuarios en la base de datos:');
    usuarios.forEach(user => {
      console.log(`- ${user.nombre} (${user.email}): ${user.diasVacaciones || 0} días - Rol: ${user.rol}`);
    });

    console.log('\n✅ ¡Proceso completado!');
    console.log('\n📝 Nota: Cada año se deben añadir 23 días más a cada usuario.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

populateVacationDays();
