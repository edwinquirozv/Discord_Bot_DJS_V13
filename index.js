console.clear();
const { Permissions, Intents, Client, MessageEmbed } = require('discord.js');
const colors = require('colors');
const ms = require('ms');
const db = require('megadb');
const akinator = require('discord.js-akinator');
const figlet = require('figlet');
const Warns = new db.crearDB({
    nombre: 'Warns', 
    carpeta: 'BaseDeDatos',
    sub: 'Moderacion'
});

const config = require('./config.json');
const intents = new Intents();
const client = new Client({ intents: 32767});
client.on('ready', (bot) => {
    console.log(`${bot.user.tag} se ha encendido correctamente `.blue.underline);
});

    ////////// PRESENCIA //////////

const time = (1000*10) //10 segundos

  setInterval(()=> {
    
    const status = [
      [{
        name: "b!help",
        type: "WATCHING"
      }],
      [{
         name: `${client.guilds.cache.size} servidores`,
         type: "WATCHING"
      }],
      [{
        name: `${client.guilds.cache.map(guild => guild.memberCount).reduce((a, b) => a + b)} miembros`,
        type: "WATCHING" 
      }]
    ]
    
    function randomStatus() {
      let rstatus = status[Math.floor(Math.random() * status.length)];
      client.user.setPresence({ activities: rstatus, status: 'idle' });
    }
    randomStatus();
  }, time)

    ////////// PRESENCIA //////////

client.on("messageCreate", message => {
    let prefix = config.prefix;
    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;
    if(!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    ////////// MODERACION //////////

    ////////// CLEAR //////////    

    if(command === 'clear') {
        if(!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para limpiar mensajes')
        ]});
        const amount = parseInt(args[0]);
        if(!args[0]) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes especificar un numero de mensajes a limpiar')
        ]});
        if(isNaN(amount)) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona solo numeros')
        ]});

        if(amount <= 1) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes especificar un numero de mensajes a limpiar mayor a 1')
        ]});

        if(amount > 100) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No puedes limpiar más de 100 mensajes')
        ]});
        message.channel.bulkDelete(amount).then(() => {
            message.channel.send(
                {embeds: [new MessageEmbed()
                .setTitle('✅ | Acción exitosa')
                .setColor('#0fed07')
                .setDescription(`Se eliminaron ${amount} mensajes`)
            ]}).then(m => setTimeout(() => m.delete(), 5e3)); //Elimina el mensaje de acccion exitosa
        }).catch(err => {
            console.log(err);
            message.channel.send(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | Error al eliminar los mensajes')
                .setColor('#FF0004')
            ]});
        });
    };

    ////////// CLEAR //////////

    ////////// LOCK //////////
    
    if(command === 'lock') {
        if(!message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para bloquear canales')
        ]});
        let everyone = message.guild.roles.cache.find(role => role.name === '@everyone');
        if(!everyone) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No se encontro el rol everyone')
        ]});
        const canal = message.mentions.channels.first() || message.channel;
        canal.permissionOverwrites.edit(everyone.id, {
            SEND_MESSAGES: false
          })
            .then(channel =>  message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('✅ | Acción exitosa')
                .setColor('#0fed07')
                .setDescription(`El canal ${channel.name} ha sido bloqueado`)
            ]}))
            .catch(err => {
                console.log(err);
                message.channel.send(
                    {embeds: [new MessageEmbed()
                    .setTitle('❌ | Error al bloquear el canal')
                    .setColor('#FF0004')
                ]});
            });
    };

    ////////// LOCK //////////

    ////////// UNLOCK //////////

    if(command === 'unlock') {
        if(!message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para desbloquear canales')
        ]});
        let everyone = message.guild.roles.cache.find(role => role.name === '@everyone');

        const canal = message.mentions.channels.first() || message.channel;
        canal.permissionOverwrites.edit(everyone.id, {
            SEND_MESSAGES: true
          })
            .then(channel =>  message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('✅ | Acción exitosa')
                .setColor('#0fed07')
                .setDescription(`El canal ${channel.name} ha sido desbloqueado`)
            ]}))
            .catch(console.error);
    };

    ////////// UNLOCK //////////

    ////////// TIMEOUT //////////

    if(command === 'timeout') {
        const permiso = message.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS);
        if(!permiso) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para timeout')
        ]});
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona un miembro valido')
        ]});
        const time = args[1];
        if(!time) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes especificar un tiempo')
        ]});
        if(!ms(time)) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes especificar un tiempo valido')
        ]});
        const tiempo = ms(time);
        member.timeout(tiempo).then(() => {
            message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('✅ | Acción exitosa')
                .setColor('#0fed07')
                .setDescription(`${member.user.tag} se a aislado por ${time}`)
            ]});
        }).catch(err => {
            console.log(err);
            message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | Error al aislar miembro')
                .setColor('#FF0004')
            ]});
        });
    };

    ////////// TIMEOUT //////////

    ////////// UNTIMEOUT //////////

    if(command === 'untimeout') {
        const permiso = message.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS);
        if(!permiso) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para untimeout')
        ]});
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona un miembro valido')
        ]});
        if(member.isCommunicationDisabled()){
            member.timeout(null).then(() => {
                message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle('✅ | Acción exitosa')
                    .setColor('#0fed07')
                    .setDescription(`${member.user.tag} se ha desaislado`)
                ]});
            }).catch(err => {
                console.log(err);
                message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle('❌ | Error al desaislar miembro')
                    .setColor('#FF0004')
                ]});
            });
        } else {
            return message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | El miembro no esta aislado')
                .setColor('#FF0004')
            ]});
        }
    };

    ////////// UNTIMEOUT //////////

    ////////// WARN //////////

    if(command === 'warn'){
        const permiso = message.member.permissions.has(Permissions.FLAGS.MANAGE_MEMBERS);
        if(!permiso) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para warn')
        ]});
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona un miembro valido')
        ]});
        const reason = args[1];
        if(!reason) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes especificar una razón')
        ]});
        const warnUser = async (member, reason) => {
            const userWarns = await Warns.tiene(member.id); //false
            let currentWarns = await Warns.obtener(member.id);
            if(currentWarns == undefined || null || 0) {
                currentWarns = '0';
            };
            if(!userWarns) {
                Warns.establecer(member.id, 1);
                member.send(
                    {embeds: [new MessageEmbed()
                    .setTitle('Aviso de Warn')
                    .setColor('WHITE')
                    .setDescription(`Has sido warneado en el servidor **${message.guild.name}**\nPor el usuario **${message.author.tag}**\n\nMotivo:\n\`\`\`${reason}\`\`\``)
                ]});	
                return message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle('✅ | Acción exitosa')
                    .setColor('#0fed07')
                    .setDescription(`${member.user.tag} ha sido advertido por primera vez`)
                ]});
            } else {
                Warns.sumar(member.id, 1);
                member.send(
                    {embeds: [new MessageEmbed()
                    .setTitle('Aviso de Warn')
                    .setColor('WHITE')
                    .setDescription(`Has sido warneado en el servidor **${message.guild.name}**\nPor el usuario **${message.author.tag}**\n\nMotivo:\n\`\`\`${reason}\`\`\``)
                ]});	
                return message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle('✅ | Acción exitosa')
                    .setColor('#0fed07')
                    .setDescription(`**${member.user.tag}** ha sido advertido, lleva **${currentWarns + 1} advertencias**`)
                ]});
            };
        };
        warnUser(member, reason);
    };

    ////////// WARN //////////

    ////////// UNWARN //////////

    if(command === 'unwarn'){
        const permiso = message.member.permissions.has(Permissions.FLAGS.MANAGE_MEMBERS);
        if(!permiso) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para quitar advertencias')
        ]});
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona un miembro valido')
        ]});
        const reason = args[1];
        if(!reason) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes especificar una razón')
        ]});
        const unwarnUser = async (member, reason) => {
            const userWarns = await Warns.tiene(member.id); //false
            let currentWarns = await Warns.obtener(member.id); // 1
            if(currentWarns == undefined || null || 0) {
                currentWarns = '0';
            };
            if(!userWarns) {
                return message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle(`❌ | ${member.user.tag} No tiene advertencias`)
                    .setColor('#FF0004')
                ]});
            } else {
                Warns.restar(member.id, 1);
                member.send(
                    {embeds: [new MessageEmbed()
                    .setTitle('Aviso de Warn')
                    .setColor('WHITE')
                    .setDescription(`Se te ha quitado una advertencia en el servidor **${message.author.tag}**\nPor el usuario **${message.author.tag}**\n\nMotivo:\n\`\`\`${reason}\`\`\``)
                ]});	
                return message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle('✅ | Acción exitosa')
                    .setColor('#0fed07')
                    .setDescription(`**${member.user.tag}** se le ha quitado una advertencia, ahora tiene **${currentWarns - 1} advertencias**`)
                ]});
            };
        };
        unwarnUser(member, reason);
    };

    ////////// UNWARN //////////

    ////////// WARNS //////////

    if(command === 'warns'){
        const permiso = message.member.permissions.has(Permissions.FLAGS.MANAGE_MEMBERS);
        if(!permiso) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para ver las advertencias')
        ]});
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona un miembro valido')
        ]});
        const getWarns = async (member) => {
            let counterWarns = await Warns.obtener(member.id);
            if(counterWarns == undefined || null || 0) {
                counterWarns = '0';
            };
            return message.reply(
                {embeds: [new MessageEmbed()
                .setTitle(`Warns de ${member.username}`)
                .setColor('WHITE')
                .setDescription(`**${member.user.tag}** tiene **${counterWarns} advertencias**`)
            ]});
        };
        getWarns(member);
    };

    ////////// WARNS //////////

    ////////// CLEANWARNS //////////

    if(command === 'clearwarns'){
        const permiso = message.member.permissions.has(Permissions.FLAGS.MANAGE_MEMBERS);
        if(!permiso) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para quitar advertencias')
        ]});
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona un miembro valido')
        ]});
        const reason = args[1];
        if(!reason) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes especificar una razón')
        ]});
        const clearWarns = async (member, reason) => {
            const userWarns = await Warns.tiene(member.id); //false
            if(!userWarns) {
                return message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle(`❌ | ${member.user.tag} No tiene advertencias`)
                    .setColor('#FF0004')
                ]});
            } else {
                Warns.eliminar(member.id);
                member.send(
                    {embeds: [new MessageEmbed()
                    .setTitle('Aviso de Warn')
                    .setColor('WHITE')
                    .setDescription(`Se te han eliminado tus advertencias en el servidor **${message.author.tag}**\nPor el usuario **${message.author.tag}**\n\nMotivo:\n\`\`\`${reason}\`\`\``)
                ]});	
                return message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle('✅ | Acción exitosa')
                    .setColor('#0fed07')
                    .setDescription(`Se han eliminado todas las advertencias de **${member.user.tag}**`)
                ]});
            };
        };
        clearWarns(member, reason);
    };

    ////////// CLEANWARNS //////////

    ////////// BAN //////////

    if(command === 'ban'){
        const permiso = message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
        if(!permiso) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para banear')
        ]});
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona un miembro valido')
        ]});
        let razon = args.slice(1).join(' ');
        if(!razon) razon = 'Sin Especificar';
        if(member.id === message.author.id){
            return message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | Ha ocurrido un error')
                .setColor('#FF0004')
                .setDescription('No puedes banear a ti mismo')
            ]});
        };
        if(member.roles.highest.position >= message.member.roles.highest.position){
            return message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | Ha ocurrido un error')
                .setColor('#FF0004')
                .setDescription('No puedes banear a un miembro con una posición mayor o igual a tu')
            ]});
        };
        if(!member.bannable) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No puedo banear a este miembro')
        ]});
        if(razon.length > 1024) razon = razon.slice(0, 1024) + '...';
        const banUser = new MessageEmbed()
        .setTitle('Aviso de Ban')
        .setDescription(`**${member.user.tag}** ha sido baneado \n**Moderador:** ${message.author.tag}\nRazón: ${razon}`)
        .setColor('WHITE');

        member.ban({reason: `Moderador: ${message.author.tag}. Razon: ${razon}`}).then( message.reply({embeds: [banUser]}) ).catch(err => {
            console.log(err)
            message.reply(
                {embeds: [new MessageEmbed()
                .setTitle(`❌ | No pude banear a este miembro`)
                .setColor('#FF0004')
            ]});
        });
    };

    ////////// BAN //////////

    ////////// KICK //////////

    if(command === 'kick'){
        const permiso = message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS);
        if(!permiso) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No tienes permisos para kickear')
        ]});
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Menciona un miembro valido')
        ]});
        let razon = args.slice(1).join(' ');
        if(!razon) razon = 'Sin Especificar';
        if(member.id === message.author.id){
            return message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | Ha ocurrido un error')
                .setColor('#FF0004')
                .setDescription('No puedes kickearte a ti mismo')
            ]});
        };
        if(member.roles.highest.position >= message.member.roles.highest.position){
            return message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | Ha ocurrido un error')
                .setColor('#FF0004')
                .setDescription('No puedes kickear a un miembro con una posición mayor o igual a tu')
            ]});
        };
        if(!member.kickable) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No puedo kickear a este miembro')
        ]});
        if(razon.length > 1024) razon = razon.slice(0, 1024) + '...';
        const banUser = new MessageEmbed()
        .setTitle('Aviso de Kick')
        .setDescription(`**${member.user.tag}** ha sido kickeado \n**Moderador:** ${message.author.tag}\nRazón: ${razon}`)
        .setColor('WHITE');

        member.kick(razon).then( message.reply({embeds: [banUser]}) ).catch(err => {
            console.log(err)
            message.reply(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | No pude kickear a este miembro')
                .setColor('#FF0004')
            ]});
        });
    };

    ////////// KICK //////////

    ////////// MODERACION //////////

    ////////// DIVERSION //////////

    ////////// MEME //////////

    if(command === 'meme'){
        if(!message.channel.nsfw) {
            return message.channel.send(
                {embeds: [new MessageEmbed()
                .setTitle('❌ | Ha ocurrido un error')
                .setColor('#FF0004')
                .setDescription('Este comando solo se puede usar en canales NSFW')
            ]});
        } else {
            client.memesURL = JSON.parse(require('fs').readFileSync('./memes.json', 'utf8'))
            let randomImage = client.memesURL[Math.floor(Math.random() * client.memesURL.length)];
            return message.channel.send({files: [randomImage]});
        }
    };

    ////////// MEME //////////

    ////////// CONFESAR //////////

    if(command === 'confesar'){
        const confesar = args.join(' ');
        if(!confesar) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes escribir una confesión')
        ]});
        const canalConfesiones = message.guild.channels.cache.find(c => c.name === 'confesiones');
        if(!canalConfesiones) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('No existe el canal de confesiones')
        ]});
        if(message.content.endsWith('-anonimo')){
            const confesionAnonima = confesar.slice(0, -9);
            const embed = new MessageEmbed()
            .setTitle('Confesión Anonima')
            .setColor('ORANGE')
            .setDescription(`**Confesión:** ${confesionAnonima}`);
            canalConfesiones.send({embeds: [embed]});   
        } else {
            const embed = new MessageEmbed()
            .setTitle(`Confesión de ${message.author.username}`)
            .setColor('YELLOW')
            .setDescription(`**Confesión:** ${confesar}`);
            canalConfesiones.send({embeds: [embed]});  
        };
    };
    
    ////////// CONFESAR //////////

    ////////// 8BALL //////////

    if(command === '8ball'){
        const pregunta = args.join(' ');
        if(!pregunta) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes escribir una pregunta')
        ]});
        const respuestas = [
            "En mi opinion, si",
            "Es cierto",
            "Es decididamente asi",
            "Probablemente",
            "Buen pronostico",
            "Todo apunta a que si",
            "Sin duda",
            "Si",
            "No",
            "Tal vez",
            "No se",
            "No lo se",
            "Si - definitivamente",
            "Debes confiar en ello",
            "Respuesta vaga, vuelve a intentarlo",
            "Pregunta en otro momento",
            "Sera mejor que no te lo diga ahora",
            "No puedo predecirlo ahora",
            "Concentrate y vuelve a preguntar",
            "Puede ser",
            "No cuentes con ello",
            "Mi respuesta es no",
            "Mis fuentes me dicen que no",
            "Las perspectivas no son buenas",
            "Muy dudoso"
        ];
        const random = respuestas[Math.floor(Math.random() * respuestas.length)];
        const embed = new MessageEmbed()
        .setTitle('8Ball')
        .setDescription(`**Pregunta:** ${pregunta} \n**Respuesta:** ${random}`)
        .setColor('GREEN');
        message.channel.send({embeds: [embed]});

    };

    ////////// 8BALL //////////

    ////////// REVERTIR //////////

    if(command === 'revertir'){
        const mensaje = args.join(' ');
        if(!mensaje) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes escribir un mensaje')
        ]});
        const revertir = mensaje.split("").reverse().join("");
        message.channel.send(`${revertir}`);
    };

    ////////// REVERTIR //////////

    ////////// AKINATOR //////////

    if(command === 'akinator'){
        const tipoJuego = args[0];
        if(!tipoJuego) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes escribir un tipo de juego\n`character`, `animal`, `object`')
        ]});
        const idioma = 'es';
        const mode = false;
        const botones = true;
        const color = 'BLUE';
        akinator(message, {
            language: idioma,
            childMode: mode,
            gameType: tipoJuego,
            useButtons: botones,
            embedColor: color
        });
    };  

    ////////// AKINATOR //////////

    ////////// ASCII //////////

    if(command === 'ascii'){
        const texto = args.join(' ');
        if(!texto) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('Debes escribir un texto')
        ]});
        if(texto.length > 30) return message.reply(
            {embeds: [new MessageEmbed()
            .setTitle('❌ | Ha ocurrido un error')
            .setColor('#FF0004')
            .setDescription('El texto no puede tener más de 30 caracteres')
        ]});
        const finalText = figlet(texto, (err, data) => {
            if(err) {
                console.log(err);
                return message.reply(
                    {embeds: [new MessageEmbed()
                    .setTitle('❌ | Ha ocurrido un error')
                    .setColor('#FF0004')
                    .setDescription('No pude convertir el texto')
                ]});
            }
            message.channel.send(`\`\`\`${data}\`\`\``);
        });
    };

    ////////// ASCII //////////
    
    ////////// DIVERSION //////////

    ////////// UTILIDAD //////////

    ////////// PING //////////

    if(command === 'ping') {
        let pingBot = Date.now() - message.createdTimestamp;
        const embed = new MessageEmbed()
        .setTitle('Ping de BrinzBotCJ')
        .setColor('BLURPLE')
        .addFields({name: 'Latencia del Bot', value: `${pingBot}ms`}, {name: 'Latencia API', value: `${client.ws.ping}ms`})
        .setTimestamp()
        return message.reply({ embeds: [embed] });
    };

    ////////// PING //////////

    ////////// AVATAR //////////

    if(command === 'avatar') {
        let avatar = message.mentions.users.first() || message.author;
        const embed = new MessageEmbed()
        .setTitle(`Avatar de ${avatar.username}`)
        .setColor("BLURPLE")
        .setImage(avatar.displayAvatarURL({size: 2048, format: 'png'}))
        return message.reply({ embeds: [embed] });
    };

    ////////// AVATAR //////////

    ////////// HELP //////////

    if(command === 'help') {
        const embed = new MessageEmbed()
        .setTitle('Comandos del Bot')
        .setColor('BLURPLE')
        .addFields(
            {
                name: 'Diversion', 
                value: '`8ball akinator ascii\nconfesar meme revertir`'
            }, 
            {
                name: 'Moderacion', 
                value: '`ban clear kick\nlock unlock timeout\nuntimeout warn unwarn\nwarns clearwarns`'
            },
            {
                name: 'Utilidad',
                value: '`avatar help ping`'
            })
        .setThumbnail('https://media.discordapp.net/attachments/988216144185921546/988660011142094888/3753259f84b05fee46d8bf435654843b_1.png?width=515&height=473')
        .setFooter(`Solicitado por ${message.author.username}`)
        .setTimestamp()
        return message.reply({ embeds: [embed] });
    };

    ////////// HELP //////////

    ////////// UTILIDAD //////////
    
});
client.login(config.token);