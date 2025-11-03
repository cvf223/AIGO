Introduction to MLX

I remember one day going to my partner and saying, "Hey, there's this thing called MLX. It's open source. We will

not make money from it, but I want to try. Like, I really want to try." She looked at me and said, "Okay, if you

want if you're going to do this MLX thing, you have to be the best, the best of the best." And I I looked at her

like, "There are people that are building this. How How do you want me to be the best?" So, it's a lot of

pressure. And I said, "Okay, I will take that challenge on. I really want to do the Samax thing. I made my first PR.

All right, everyone. Welcome to another episode of the TwiML AI podcast. I am your host, Sam Sharington. Today, I'm

joined by Prince Kenuma. Prince is an open source developer focused on optimizing AI inference on Apple silicon

devices through projects like MLX audio, MLX VLM, and MLX embeddings. Before we

get going, be sure to take a moment to hit that subscribe button wherever you're listening to today's show. Prince, welcome to the podcast. Thank

you for having me. This is so surreal. Um, I went from like watching from being a spectator of this fantastic podcast,

especially back in the day with Emlops and coming today to talk about what I am excited and working on currently, which

is surreal as well. Yeah, I am really looking forward to digging into uh our conversation. You

know, I consider myself a a beneficiary of your work, bringing lots of interesting models to Apple Silicon

devices. You know, one of which is sitting on my desk here. And, you know, I'm really curious about like how you

got into it and, you know, how you approach it, where you see things going. How did you begin working on Apple

Silicon? So, I'm originally a machine learning research engineer. So I've been working

on optimizing uh ML inference as well as training pipelines. So you can think

about the models that are state-of-the-art in open source. I contributed to some of them as well from

RC and helped many many companies establish their MLOps pipeline for training and inference. Um, so I've

always been op like focused on optimization and making sure that we can get the most out of the hardware that we

have as well as software. Um, contributed a lot to projects like PyTorch, Lightning and many others in

the space. Um, I got started with MLX ,

end of . So I uh just left Neptune and I was just experimenting with

different things. I tried uh some projects and then I saw MLX for the first time. At the time I had like a

MacBook M M Air. I only got it because I wanted I wanted the lightest laptop

and the most uh durable laptop and like that was a gamble. Apple Apple's first

silicon uh version uh on the Mac and I was like, "Okay, let me try it out. We already use iPhones every day. Let me

see how this goes." So, I bought it um and I was just trying it out. I

installed MLX. I tried inference the first time. It was pretty slow and

it was very slow. It was really really slow. So I looked at it. I said, "Okay, I will not judge

it from day one. I think the promise is here. We can quantize models locally

pretty fast." And when I saw how fast the quantization process was, that's where it hinted me that this will get

better. and I started investigating more. I got to know the people behind it. So, Anui and um u the MLX team. Um

Angelos is one of the one of the the people that I know. So, I reached out and I started looking what they're what

they're doing. Their GitHub was super super active. And I remember one day

going to my partner and saying, "Hey, there's this thing called MLX. It's open source. We will not make money from it,

but I want to try. like I really want to try. She looked at me and said, "Okay, if you want if you're going to do this

MLX thing, you have to be the best, the best of the best." And I I looked at her like there are people that are building

this, how how do you want me to be the best? Um, but that's that's kind of the standard I set uh always and my dad has

set for me as well. So, we never we were never allowed to have second place like

in in my family. That's like not our reality. You you're either the best or not. And that's why he gave me the name

Prince and my sister's name is Queen. It's like it's a lot of pressure.

Yeah. So, it's a lot of pressure. And I said, "Okay, I will take that challenge

on. I really want to do this MLX thing." I made my first PR. This was about this

was a porting um Hugging Face Star Coder  to MLX.

I said, "Okay, I'm going to do it during the weekend." I get to the weekend, there was already a PR. But when I

looked at the at the PR, I saw that there were a lot of things missing. Um um I said, "Okay, let me try and do

this." So, I make a parallel PR. My PR gets gets working, but the person that

sent the original PR was already uh almost finished, but did was just missing one tiny part. So they looked at

my PR said, "Okay, we're going to close this PR, but we're going to take the thing that works and put it in another

PR, okay? And we will add you as a contributor." I said, "Great." So that was the first contribution to MLX. And

after that, I just got addicted. I said, "Okay." Uh, MLX, MLX has the promise of

um local inference that PyTorch and TensorFlow and many others tried in the

past, but didn't really succeed. um it's the fastest way. Of course,

there is llama CPP and llama CPP is great as well. But when I looked at MLX,

I said, "Okay, this is optimizing only for Apple silicon." So, there is untapped potential that we will be able

to reach compared to a more general approach and we have the people that um

are designed the chips helping us uh do this. So, I said, "Okay, what's missing in MLX right now?" First, it was the

models. We just didn't have enough models. Uh second, we didn't have enough

um operations, so uh enough modules to be able to build new models. I set out

the mission to establish the developer tooling as well as port as many models as possible. So I ended up porting a

thousand models last year uh to MLX. Um well, this these are mostly

quantizations. uh if you count just models it's around  to  uh individual model but but uh quantized in

different versions of sizes of the model are more than a thousand so I started

contributing it was week over week day over day and as the more I did the the

faster I got so it got to a point where any new model released on the internet

it would only take me like  minutes to port it to MLX. So people started

getting this this idea that I am some kind of a superhero because I would not

I would be on Twitter just waiting for a model to drop and then the m the moment that model drops I would port it as fast

as possible and uh and then I there was this situation

in particular in the beginning that made me even more committed to MLX which was

there was a model I think from Coher that was like a red billion parameters and I only had the MacBook M

with  GB of memory. It's impossible to run that model there. Like there is no

way you would be able to run it um at a at a sufficient speed. So um I'm trying to remember the name of

that model. Command R. I think the command R. Okay. I was thinking of an earlier one. Command R. Okay.

Probably probably is is an earlier one. I I don't know if if it's exactly that because they they released so many now

but what was one of the early coher models  billion and I said okay this is not this is not fun most models are

small but this is too much so I literally coded that model blind so I

just coded the model and I asked an one of the creators of MLX to run it on his

MacBook ultra uh Mac Studio Ultra and he would give me feedback whether the code

ran or not. So that was a very interesting um

experience. So I was just totally blind. I had no idea whether it would run or not. He just ran it. I was like, "Ah,

it's working or it's not working." And based on whatever error he he he sent me, I would uh uh you know, pretty much

change my code and send a new commit. And around that time, I started thinking, okay, if I really want to take

this seriously, I need a more powerful machine. Um at the time I was working

with a um fund to they fund pretty much

exceptional individuals to run projects. I was funded to create a series of models open language models including

data. So I created the misuse. It's a two billion parameter model that punches way above its weight or at the time it

did and I just was working on that whilst doing MLX. So, I used pretty much

enough of like six months rent um of the year and I put that on on the MacBook

that I have right now, which is an M Max. Um and then the community I thought you were going to say studio.

No, a studio is coming. Actually, I just uh ordered it uh last month. So, the studio is coming. Um so, I ordered the

M Max. The community was outraged. How come Prince does not have like a big machine? I I was I was doing this really

out of love and when I really care about something, I go all in. I don't know how

to go halfway. People said, "Okay, Apple should give you something." I said, "No, I'm not really doing it because I want

something from them." And we ended up talking and I was like, "Oh, this is not really something that we can do." And I

said, "Of course, don't worry about it. I do this out of love and I will find a way to make it work." So I gambled on

six months rent uh on the on the M Max and it panned out. So I I did some of my

best work in the past year. Because of that I managed to build uh MLX vision

language models which is basically running all of the best open source vision language models on your Mac uh as

well as on your iPhone now with the Swift implementation. And I also happen to create themlex embeddings as well as

audio thanks to a much bigger and more powerful machine. Um, let's take a step
Timeline of MLX

back and I'm trying to remind myself of the, you know, that early history. Like

I also had an M MacBook Pro and I

remember kind of as you describe like in the early days like it was clear it

was an amazing machine just you know relative to the Intel Max in terms of

like uh the everyday user experience like it

was you know snappier like you had a lot less of this whole spinning beach ball thing that we used to remember from the

Intel days uh but for for you know running ML models and local

inference like for a long time if I'm remembering correctly there really wasn't anything there and then like we

had uh the we had llama CPP and that became

kind of like a a general framework in a sense that I remember

like when whisper came out like we're waiting anxiously for, you know, the

whisper CPP version. Um, and is it I've not talked to Georgie. Do you know

Georgie who does those models? I know him. I don't know if he knows me,

but I follow him. I follow him and I I interact sometimes, but I Well, same here.

Yeah. Uh so you know he like you know was one

of the first folks at least that I know of that was like trying to bring these models to uh Mac. And if I'm I guess

where I'm asking for you to chime in is like my memory is that it was after that

that MLX came out. Like MLX didn't come out with the M devices. There was a bit

of a lag and Llama CPP was first. Um, but then it was like this is the thing

and oh my god it's fast. Like am I remembering that history right? No, you're remembering it correctly. So

I think if I'm not mistaken, Lama CPP came early with the first open source um

um large language models. So you could run I think Mistral the early Mistral

models and so on and even Llama I think the name Llama CPP also comes from from

the Llama series of models. Uh MLX only came out if if memory doesn't escape me

end of . So around December , that's when it was originally released.

M the first M. I remember getting my M in , which was around the time it

was released. So around  years lag between MLX and and um the first uh

series of uh Macs with Apple silicon. So yes, MLX an official Apple product.
Is MLX an official Apple product?

Well, there are questions about that. They they did get the recognition this

year with um WWDC. So it was in the forefront of

WWDC. Uh but before that it wasn't really a lot of indication but it is a

official Apple product because it there is an actual Apple team of employees

working on this. Um how is it like on like a Apple GitHub account or is it a separate GitHub?

Yes. So they have a GitHub that is I think ML explores

um and that is a repo that belongs to Apple. If you look at any MLX code MLXLM

in particular you'll see at the top Apple um copyright. Okay. So as far as I

know it is. How center of their strategy it is I don't know

but I think it should be. Do you have a sense for
Is MLX used in Apple products?

whether MLX is used in Apple products or

is it you know an external library but like they're writing directly to lower level hardware or doing something

different when they're you know building out their apps. As far as I know at the

moment, it's not being used at any official product

they're using mostly core ML and Swift. Um, and also they have their

own package, the foundry, I think a foundry something that was released recently. So those are the main

uh products that are being used to run their AI strategy. um MLX I'm not sure

but I think it's not yet there but honestly speaking I think it should be

um the discussion here would be around because we are not using the

uh the NPUs or no not the NPUs uh how do you call it the we are using GPUs MLX

uses mostly GPUs and we are not using the specialized u uh part of the chip that Apple designed for this Got it. And

core ML does use those. Yes. Does MLX is it a not yet thing or is it

um you know not possible or does the MLX team not have access to

something that doesn't allow them to use the you know the these a AI focused

components on the chips. I think it's mostly because MLX is most right now

focused on GPUs and GPUs as you know especially on the phone won't be as

efficient as the neural engine. So the neural engine is specialized for this.

Um it consumes less energy than if it were if you were running the GPU. So

especially for iPhones I think this might be a concern. Um, but when it

comes to your and my question is like why doesn't MLX use the neural engine? Did the MLX

engineers like not have access to access to it or is it incompatible

ideologically with what MLX is trying to do? Like seem like that's a really good question. I think I

will I will ask an about it. like I tried to think about it but I didn't go

too deep because for me personally as a researcher uh GPU is what you mostly use

especially if you want to run some fine-tuning some training and it's just a much uh direct approach to building

this. I think building a strategy where you use the neural engine and the GPU might be a bit more complicated and

harder to do than it is for you to use the GPU and the RAM. So the unified uh

RAM architecture between CPU, GPU and and the RAM makes it much easier for you

to move around data. But if you want to do that and also put it into the neural engine, I think it might be a bit more

complicated to do. Um but I will definitely ask him and and get that answer for you and I'll post it on

Twitter when I get it. Okay. Do you have a sense for how the
Neural engine vs. GPU

neural engine is used relative to the GPUs? like are there,

you know, are are you able to do the same things in terms of local inference with the neural engine or do you have

I'm imagining that you likely have maybe memory bandwidth constraints or other types of constraints that make it like

it's for smaller models than the the ones that you're starting to deal with nowadays with MLX.

Exactly. So there was a discussion around this on Twitter uh and I think

there's a guy called Ani ML on uh um on Twitter and he's one of the main main

persons focused on core ML as well as an I saw the discussion and the discussion was exactly about this. So the neural

engine you cannot fit as big of a model that compared to the GPU. So you would

be very limited in terms of the models you fit and how you fit them. So for MLX

you can just take any hugging face safe tensors model download it and it will

run. For the neural engine you need to make all those optimizations and and uh

trace the model a certain way so they will be able to run and also the exactly

so the the size of the memory or the size of the model will be constrained because of that. Does the neural engine

exist on the desktop Apple silicon devices or only on the mobile devices? No, it exists on all.

Okay. So you you you have access to the neural engine. It's just that right now

you can't necessarily choose that because we don't have a platform that would give you that uh performance uh

trade-off. So it's mostly GPU. I think it's it's the most pervasive uh around

all of all of them. So you can the same architecture can be used for iPad,

iPhone, even Apple TV if they do put Apple silicon there as well as Mac. So

it's just much easier that way. And you can load really really large models. Um

you can for example load a  something billion parameter model contis down to

bit on a M with  uh GB of RAM. you

wouldn't be able to load that big of a model into the neural engine. Yeah. Most recently, we've seen folks,

you know, I've seen a lot of chatter on Twitter about uh the new OpenAI

uh open source models and folks trying to get these running on, you know, very

old and, you know, much smaller like these  gig M Max. And apparently they

do work. Uh performance isn't amazing, though. It is possible. I think we could

optimize inference further especially for mixture of experts. I have a a

counterintuitive uh argument which is we have those experts and they are active

at different times. You're not loading you don't need all those experts in memory. If we could find a way to

quickly uh load only the experts needed during

the particular inference step that you're doing, we could be able to run it at a more like a faster pace. But that's

something that's not yet been done. Um I know this because last year I uh ran

inference on um Mistral uh the the Mixtral uh which is the mixture of

X-rays model from Mistral across two uh Apple silicon devices. Um I I was kept

of course by the bandwidth of the smaller one which is the M but I could get around four tokens per second. And

my idea was we could offload the expert uh layers to a more powerful machine and

quickly do this hot swapping between GPU CPU um between the experts and you could

reach decent speeds. So I got about reading speeds which is around four tokens per second using Thunderbolt .

Yeah, five. Yeah, Thunderbolt . So you could we could definitely optimize it

further. Um and who knows potentially in the future be able to run this um in a

smaller device by pruning some of the experts away and getting a much more compact model that is just decent for

the particular task. So the pruning that you're talking about is like a real time adaptive pruning.
Fusion

Like you wouldn't be eliminating experts altogether. You would be swapping them in and out on the fly like trying to

anticipate which expert is being uh invoked for a given inference. This is a

very interesting question because we were when I was at RC it was one of the

things that I was working on as well which is I created me and a colleague of

mine uh created something called fusion and the idea of fusion came because I

was working on pruning. So when I when I joined RC, I had released llama the f world's first llama  with six billion

parameters by pruning the  billion parameter model and then doing continuous pre-training on that model.

So I could actually recover more than % of the performance of the  billion parameter model in the  billion. So my

idea when I joined was okay let's explore and see if we can prune the width of the model. So the neurons of

the model or the layers. And within that research, I found something very strange. When I was trying to do pruning

of neurons, I found out that if if I apply uh pruning on particular neurons,

you could keep the language of the model. So the model could still speak English and then when you apply it to

others, the the model would completely collapse. Um and I was like, okay, this is very

interesting. I I talked to this colleague of mine uh Fernando and I said hey I'm seeing this really weird uh

behavior every single time I prune the model since it's at random I get

different behaviors I expected a similar somewhat behavior but even if you do

somewhat uh closer or less random approaches the model will still behave completely different and we theorize

that there is a subn network within uh each model whether dense or expert that

is responsible for certain behaviors of the model. So meaning it's responsible for cognitive behavior meaning be able

to do math uh or linguistic behavior which is be able to understand English and output English.

And then we ended up making fusion which is basically an algorithm that scans your net your uh model and is able to

find the most important characteristics of the model or the strongest characteristics and you can actually

take those and apply it to a different model and then the resulting model will have characteristics of both parents

without any training. This brings me back this is based only on you know access to

the weights. It's not based on like querying the model. No, no, there's zero queries. I'll give

you a a precise example of this. So, we tested out something he fine-tuned uh 

I think. Yeah, I think it's . or or three to do function calling and then we

took the the function that that particular model and merged it with the

original model, right? fused not necessarily merge but merging is just

fusion process do the fusion process with the original model. The original model initially could not do parallel function calling

but after uh fuse fusing with this uh checkpoint we could now do um uh how do

you call it parallel function calling and the resulting model had better performance than both models combined.

uh not combined but better than both models on average and this is with zero training just access to the weights that

that doesn't sound surprising if we're talking about the same model like you

have one if I'm understanding the scenario you took uh 

and you trained it and then you took another  and you like that seems like

you could just do a diff on the weights and like move over things that change and then you would at the new behavior

and uh not necessarily it's it's not that simple. So merging already existed for a

very long time. You have slurp you have all other tech uh techniques but fusion

it actually surpasses merging by a mile like in terms of performance it's it's

reliably better overall. And we also did another experiment where we were train

fine-tuning a model and by fusing intermediate checkpoints until the end,

you end up with a much better model at the end in terms of um uh eval

performance across the board compared to just taking um all models or even doing

traditional merging. Are you saying that you're

um I guess I'm trying to get at like what

you know maybe where I'm oversimplifying it you know or where I don't have the right mental model of this like

what would be more compelling to me is if either like you're able to do this

fusion across model families which just sounds like really hard and messy. Um

okay okay you know or like you know you've got you know a version of a model

and you know you okay you've post-trained

both ver both models and you know this model is post-trained to do you know X

and this model is post-trained to do Y and you are able to fuse them and this

model can still do X and uh and now it can do Y like these are

that This is exactly what fusion does. So it's not only about those examples I gave, but it does this reliably. There's

a paper from uh a China university t something. I don't want to botch the

name. There's a there are papers from cohhere now talking about this. Um so it

it is a it is a pretty a pretty great uh new technique. So it's capable of of

doing this and because of that research that I was doing it brings back the idea

that with especially mixture of experts we could do a lot of things to optimize them. We could do early early exit. So

for instead of processing the mod the the token all the way down we could find a mechanism or ways to train the model

to skip and just go to the end. That would improve performance. Another one would be offloading the experts to the

CPU. Um, you don't need all the experts loaded at all times. Um, and there there

are ways of doing this without having a query to test this out. And there are

ways to do it. It just depends on what you want to do and what is your what are what are your constraints. If you if

you're on mobile, you definitely don't want to be doing this uh on the-fly optimization. you probably will just

create a submodel that has those properties that you want to run on mobile. But if you have more resources

like on PC, you you should be able to just do this on the fly.

Okay. Interesting. Interesting. Um,

and so you've, you know, taking a step back and talking a little bit about like
Model porting to MLX process

the you you talked about how you've kind of moved a thousand, you know, models over

to MLX. I'd like to understand when you're approaching a new model, like

what that process looks like. You mentioned quantization, you mentioned pruning. These are things that we've

talked about on the podcast quite a bit like but how are you thinking about the process?

So I actually have a YouTube video on this where I walk people through the

entire process. But basically my process is is quite simple. I go to hugging

face. I go look at the configuration of the model. Usually most models have a have a similar architecture. So the

model type matters a lot. you you should be able to see the model type and know whether it already exists in MLX or not.

Um if it doesn't I go ahead and look at that in this case is something like

transformerbased or something else or is it a higher level? It's a high level um

argument in the configuration of the model that you can use to see whether

usually in MLX right now all of the models the name of the file of the of

the file the Python file or the folder of the Python files is actually the model type. So that when we are talking

about like say vectors versus another kind of uh artifact or something

else like what what are examples of types? Okay. So basically let's let's take uh co here. So they have command R.

Let's say the model type is command R in MLXLM. If you go to MLXLM and then you

look at the models folder, you should be able to see commandR.py.

That file contains all the code necessary to run inference uh using that

model. Right? So that's what I mean by by model type. Hugging face uses model

type to load the tokenizer to load I think model model uh weights as well.

Um and we just do it a more direct approach by calling the model type as the model file. Um and what I mean by

that is like usually if it already exists you just run the model you just

download the model for mugging face and run it uh through the CLI or through your own Python script. Usually it's

just MLX name of the project.generate and that should be enough to generate u

an initial response. Um if that does not exist then I go look at the transformers

implementation which they usually have a a transformers implementation.

I look at the code and I just convert one by one. MLX in is very similar to

PyTorch in terms of the API design. Um it it's more inspired by NumPy and Jax,

but uh it overall is pretty pretty close. If you put them side by side, you

you'll be able to see where the commonalities are. So you just look at the Python class. Let's say it's

defining the vision part of the model. You just take that code and look at the

uh MLX syntax and you should be able to convert it pretty easily. There are a

lot of foot guns because MLX does things uh uh differently um from PyTorch. You

have to have experience um with that. But it's pretty easy because there we already have a lot of examples. So if

you see a particular component on let's say command R and then they release command A. If you go to command A and

you see that it has a similar class that already exists in MLX, you can just copy that in and you should you should be

okay. Uh I'm talking in terms of like beginners, advanced people, I would just say spend time in the MLX documentation.

Spend time looking at the code that already exists. Spend time looking at the PRs of adding support for new

models, especially the family of models that you want to add. And then you'll be able to see the pattern and you'll be

able to see what you need to do. Um, in very rare cases, you will need to pretty

much write something from scratch. Uh, and those are the hardest ones. So, with

MLX audio, for example, I had to write a lot of, uh, layers uh, from scratch that

just they don't exist in MLX right now. Uh there is the then I sent some PRs and

and some people helped me send some PRs to MLX to add those layers in but those

are very rare cases. It only happened to me because audio it wasn't really as um

front and center for MLX initially but now it's kind of taking up that space and and they are more aware that audio

is kind of taking uh growing as well as video. So usually I just look at the

config file, identify whether it exists or not. Second step, I just implement it

if it doesn't exist and after that I just make a new release. Um and the models are uh on MLX. After that, after

the release is done, I usually upload all of the model weights to MLX in

particular setups. So the first one is quantized to three bits, quantized to four bits, quantized to five bits, six,

 and B float  which is usually half precision from uh the original models.

Some models are uh float . I just do half of that. We still keep the uh same

quality and speed um compared to the original. And people can just choose. So

if you have a smaller machine, let's say an M, M Pro, you can go for the bit, bit uh models or even five depending on

your RAM configuration. And then if you have more performance, you have a kind

of middle range MacBook to high range, you can go for the bit or  and Bflat

. Are you just like programmatically uh producing the various quantized
Model quantization

versions of the models and uploading them or are you doing like testing to

determine like where that performance quality sweet spot is and okay for this

one you know four bit works but you know two bit doesn't work you know for this

one we can get it down to two bit like or is it like you just do it and it's up

to the user to determine what works for them and where they want to make that tradeoff.

Wow, Sam, the questions are really good. So,

initially I used to do this by hand. I would do one by one manually and test

them. But nowadays, I have to port an average of like two to three models a

day sometimes. Um and that is just and sometimes even more depends like in

the morning could be open AI in the afternoon could be entropic and evening could be mistrial. So I I never really

know who's releasing. So what I do I test out the four bit and three bit.

Those are the two that I I I see the results and then the rest I don't see the results because I expect the

performance to be good. I expect the performance of those ones to be good out of the box. But the three

bit some models just are too small or too fragile or sensitive to quantization

that bit will will not give you any good outputs. So I watch out for those.

bit is usually standard. It just works. Um might not give you the best

performance when it comes to for example vision language models. Uh but it works pretty well for text and audio because

even when you think about audio it's especially the more recent audio models they are language models. So the tokens

they are outputting are you could imagine them as just normal text tokens. So they are a bit more

resilient to to quantization but vision models they are quite sensitive. So

three bits you have to see how big the model is. If the model let's say is one billion parameter probably doesn't make

sense to make a three bit uh version of that model because it's too small to uh

you're compressing the model too much. Yes. So I usually just test out those

those uh two and then the rest I upload and I wait for community feedback. Right

now on hugging face I have let me just quote this correctly. on a face. I have

over uh , um notifications.

These are people that want you to port their model to MLX. Sorry, correction. Not ,.  uh.

Sorry, not ,, but ,. Um they these are people giving me feedback on

particular models asking for ports of new models and usually these also end up

on GitHub. Um and I just I just have lots of notifications. I think , is

because I also have email and in overall I was I was counting this this week I have over , notifications across

all platforms. So, so yeah, I I I'm imagining you building like some LLM

based thing to like go through all these notifications. And I talk about that a lot. I actually

released a video recently talking about cloud code because my expectation I had

this stream I actually posted. I want a system that could be a great um

intern for me because I want someone to check out the PRs. I want someone to see

the GitHub issues across all my projects and just notify me if there's anything.

I already have a body of work so the model could just see whether the new PR has the standard that I h I want or just

you know give me an initial breakdown of what is there because it's like too many things to to manage but we're not there

yet it's still still a long way to go before we we get to to an agent that you can reliably say here are the keys to my

life go wild plus I I I really I especially with open

source I want people to know that I care, know that I am there. I'm I'm reading every single notification. Um I

just usually keep them as unread because it's easier to go back to some of these notifications on hugging face. I don't

check because it's it's too much like there there there's a lot of things going on. Uh GitHub for sure. It's me.

It's always me. I'm there all the time. You've talked about quantization so far.

You know, pruning you mentioned as well. like is that uh an extraordinary thing
Pruning

that you do a regular thing that you do like when do you incorporate pruning into the process of porting a model over

okay so I didn't mention this so with quantization there are a couple new

techniques uh especially the ones developed by an for and team one is

called DWQ and AWQ you every everyone already knows which

is activation aware quantization. Basically, at inference time, you figure out which neurons fire the best and um

you quantize the rest. And then DWQ is more of a quantize the model down and

then use a higher precision model either an  bit for example if you quantize the

the model to four bit or you use the full precision model and you do dist sort of distillation. Um so basically

you're taking the the model quantizing it and recovering some of that performance through distillation.

I am quite familiar with this. Uh at RC we we worked on distill kit. It was one

of the things that we were pretty much the best at uh doing where and we created this toolkit where people can do

it as well. Uh that technique is pretty good. Right now I just don't do it because it requires a lot of compute.

I'm waiting on the M Ultra that the community got me to be able to do that.

So once the M Ultra gets here, I'll be doing more of these specialized

fine-tuning um of quantization models or quantized models. Additionally, with pruning, I

think it also falls into this bucket. It requires some compute to recover the performance of the original model which

means you have to take some data set and train the model train the the model again a little bit or have a Laura to be

able to recover that performance because what you're doing at the end of the day is is cutting the model dry. You're just

going in and say hey you are out you're out you're out you're out. Um, even if you have some sort of metric that tells

you which neurons to to prune, which is something that I do. I I created already

the algorithm to do this, you still need some training. Usually, you would need

an A cluster of GPUs to do this. And I I'm just waiting to get a more

powerful machine to be able to test out some of these uh new techniques that can improve the performance of quantized

models. But I'll give a shout out to actually Deepmind. They have been

creating a lot of um quantis quantized aware models that they train already

beforehand towards being optimized for to bit or even lower quantizations. So if more

companies did that, I think that would actually save me uh the time and save a lot of people from the community the

time. So, thus far we've primarily been talking about models that other people create and you help port over to MLX.
MLX-Audio, MLX-Embeddings, and MLX-VLM

Uh, but in the intro and and you've mentioned uh MLX audio I believe uh

there's also MLX embeddings, MLX VLM like these are models that you've

created. Uh so MLX audio and embeddings and MLXVLM are mostly packages for doing

inference fine-tuning. um of these models and some sort and and and and

other optimizations there as well. Now we are actually working on a model

before we get to the that model then so the these are all similar to when you

mentioned audio like MLX is the foundation but in order to support audio

models there's a core set of components that are required and that is MLX audio

you've like built out this kind of audio adaptation layer or um yeah, you tell me

what you call it, but that's the way I'm thinking. You can think of it as a as a package or Python library and even swift, we now we

also have a swift uh uh package that allows you to run inference of all the

models that we port. So just like MLXLM, we when we see a new model in audio, we

port it there and we provide you the the way to do inference and this can sit on

top of your applications as your local inference engine. We have servers so you can start a server that runs in your

MacBook and serve it to your network. So you'll be able to generate audio or process audio on the fly in your network

or use the Swift uh um implementation where you can build an application with

MLX audio components built within. So you'll be able to generate audio, do

audio understanding and more. Got it. So the way to think about this is I've got a model that's a file that's

a bunch of weights that's structured in a particular way. uh MLX um knows how to take those

weights and like do the math that require that's required to constitute a

model but then you still have this problem of efficiently

invoking or using MLX to do an actual inference and that's what these

libraries are you know for audio and embeddings and VLM exactly so it it's it's quite quite

interesting I ended up creating more libraries that I wanted to. The MLX VLM now is basically an Omni uh package. So

we we do inference of more than language mod vision language models. We now do inference of models that support audio

as well. So I wish all of this could be like one package but unfortunately just

for the sake of my sanity I needed to separate them and be able to think about them individually. But maybe VL MLXVLM

comes to supersede all these other models and becomes like a a single package for MLX inference.

I think this is going that way especially with the

event of or of what I call media models. So models nowadays not only support uh

text or vision as input, they support audio. That is something we support at the moment. Soon we we will support uh

also we support v video we could consider that as well but soon we will support even more types of modalities

and eventually I I see all of that kind of falling into MLX VLM then I would

have I would have the problem of renaming it to something either MLX oh

is taken so I have to think about a new name but eventually I I think that is the direction the industry is going

overall I'll talk more about that uh later But right now, MLX audio is

focused only on audio models. So if you want to do text to speech, speech to text and speech to speech, um you can

use MLX audio. A great example of this, I don't know if you heard of Unmute from QI. We have a similar pipeline that we

released to open source uh weeks prior to their launch, which basically what

our pipeline does, it's called the modular speech-to-pech pipeline. It allows you to take any language model or

vision language model and turn that into a speech-to-pech conversation. So you

can turn that model into a chat GPT with voice for example. So you'll be able to speak to it and have it speak back to

you and you can use whatever language model or vision language model you are

you are most most interested in. Interesting. And so

the like how is that working? I got the impression that in order to have a,

you know, let's say useful experience for speech to speech, like you have to very tightly optimize that loop. Um, and

so like being able to like to to say that you have like an abstracted one that you can just plug in any model like

that sounds hard. No, it actually works. So So the the the beauty of it is the entire pipeline runs

on MLX. So all of the models so the speechtospech to text model is MLX model. So right now we support whisper

and parkit which are the top uh automatic spect

model. Mhm. Yeah. And we also support Gemma N through MLX VLM. So Gemma N also

supports uh audio vision and uh text as input. So you could also count that as

as one model there. Then we have the language model component. You can take any language model or vision language

model supported by MLX and use it there. So you can use a model quantized to

three bit, bit, whatever quantization you want in whatever model we support. And then we have the texttospech part uh

which is also on MLX and it was how MLX audio was created. So you can take u you

can choose cockro which is a  million parameter model. It's tiny tiny tiny model. You can use all of the existing

models we have including sesame and etc. And our upcoming model that u is going

to bridge that gap because right now all of the existing models don't do

streaming um of responses and if you were to do this to stream the audio back

it will be super choppy. we are solving that and our model is able to do pretty

much real time uh on M Max full precision. So this is full

precision. If you quantize it down we should be able to do real time or close to real time even on a M Pro um and pro

potentially M. And this is what the the new model you're working on? Yes, it's called Marvvis. So it should

be out. Yes. My really awesome real time uh intelligence system.
Marvis

as opposed to just another as opposed to Jarvis. So this is this is where we we are super excited and I I'll

I will share more details about this later today. Okay. Okay. Um later today in our

conversation or later today on Twitter in our conversation as well as on Twitter. So let's do it. Share more details. Tell us

about Marvis. With Marvis, we wanted to solve the problem that we also had with

the modular speech speech pipeline. It's pretty fast, but if you want quality and

you want to be able to stream, let's say you have a really large text that that was outputed by your language model.

With previous models, you'd have to divide characters every  probably

characters or or every hundred words and be able to create audio for those individual parts or paragraphs. And that

is not good because the audio will be super choppy. One, second, you'll have

interruptions that are unnecessary. So the audio will not feel natural. You will see, for example, you might have to

have a break mid-sentence because if you generate any longer than that, it's

going to take a long time for the user to hear the feedback. um we found out about a particular

decoder that is able to do streaming. So we have around  million mill 

milliseconds of uh uh response time for the first audio. And I was like okay

this is great but there's no model within the category that we are aiming for which is just a few hundred million

parameters or even just a few million parameters. So we set out to build this

model and we have like I'm very happy to to announce that we we succeeded in

that. We have our first model. It is about  million parameters and it can

run real time on Apple silicon. Um and you'll be able to pretty much hear the

voice as it comes with with no breaks or even like lag detected.

Talk to me about like what the model is. Is it a port of some other model? Is it

a post-trained version of an open model? Is it a groundup model? So we we built

this model from scratch. Uh we are training it from scratch. It's it is based on an existing model which is

called sesame. We kind of were inspired by the data they shared which is not a

lot. the only we only have the inference code and some blog articles to go from,

but we managed to reverse engineer um most of it to be able to have a great

great model. And we trained it from scratch using uh a few uh Nvidia cards.

Uh initially it was a cluster. So I burned $ initially training the first

version. Uh it turns out we needed to optimize a few things. We optimized those further and now we we are training

using a single uh GPU card. Um and we just finished training of the first

version. Now we are training a even smaller version of the of the previous one so that people u with even less uh

capable machines will be able to run Marvis uh close to real time.

So it's basically the architecture is basically a language model. um it's a language model that gets your text in

and outputs audio tokens and those audio tokens are decoded into um audio at the

high level but we will have we will have the data we will have the article the code everything will be open sourced

um you know what are some of the things that you're see seeing folks do with uh kind of these speechtoech models
Voice agents

primarily like audio assistant types of experiences or uh have you seen anything

that that really blew your mind? To answer that question, I need to go back a little bit in time. Uh late last

year, I was making a demo for Data Science Summit. I think the shirt I'm

wearing right now. Uh I've been uh speaking there for pretty much the past

three years. And I was thinking about an audio solution because I had one

problem. I created a computer use system using VLM. So I had a MLX VLM model,

analyze my screen and be able to click stuff and and achieve a certain task bas based on my input. But every single time

I had to uh start a task, I had to walk to the computer. And that became

annoying. And I said, why why do I have a computer agent, but I have to sit in

front of the computer and I have to watch it do everything I told it to do. I don't want that. If if it's an agent,

it's supposed to be kind of in the background doing this, and I should be able to command it in any way, shape, or

form. Um, and on top of that, I think the mold the the major reason why I

created MLX audio is because um, my father is actually blind and he became

blind uh, in the past uh, five years and he loves to read and I told him, hey, I

will help you read. I think in  I promised him that I'll help him read and navigate the world again. It's part of

the reason why I created MLX VLM to help him see. So, uh, he he has an iPhone.

He'll be able to like navigate the world and be able to detect what's in front of him. I actually made some glasses for

him, but those are just not Ray-B band quality. They would be super bulky for him. On a hackathon, I I made some

glasses that would help him see the world, but it didn't work out. I just saw there's a there's some a group that's doing like an open platform

glasses. Have you seen that? All right. Well, if I get my hands on Yeah. Yeah. if I get my hands on those,

my dad will be able to see the world again. So, I promised him I would I would help him see the world. And ever

since I've just been focused on vision and natural language. And now with audio, the the task was he loves to read

books, but he can't really read physical books anymore. And not every book is on Audible. So, I told him, okay, I'm going

to generate the audio of the books that you want. So, he would give me some books that he wants. I would generate the audio, send it to him. he could

listen to those books using MLX audio. Um, and that that that is like part of

the reason. But then going back to the computer use uh use case, I thought,

well, what if I could just sit on the sofa the way I'm seated right now and I could just say, "Hey, Marvis, go ahead

and order me this or find me this or send an email to Sam saying, "Hey, this

was amazing." That should trigger the agent. the agent should go on and do the task and just

give me feedback as it's going. Now I open Chrome. Oh, now I'm actually writing the email. I wrote this to Sam.

What do you think? Like I want that that level of interactivity. So I set up to build MLX audio to solve

that problem. And I made a demo I think on the first month that I released MLX

audio doing exactly that. So we now have computer agents that run locally that

can be able to speak which is great. Um so with with uh with Marvis this is

going to take this is going to go to the next level which is actual real time voice agents that can have a full-blown

natural conversation with you and it should be close to a conversation you would have with someone that's next to

you. And it can also clone voices. So you can use the the voice of a loved one even if you want to. So that that could

be really cool. For my dad, he hasn't seen me in close to  years. So I could make his voice agent sound exactly like

me and I already have that uh running locally on my machine. Oh wow. Wow. Um

very cool. You uh I know you did a video recently on cloud code. But I think you mentioned it

in our conversation. Uh also that would be a great use of a speechtoech agent.

So you can like code your way through a cloud code project as opposed to like

using you know whisper flow or something like that to paste into the thing. Absolutely. Uh it could be even built in

cloud code. I just don't have the bandwidth. Like I have so many ideas but I just don't have the bandwidth to do.

Like if I were to to um give into my cravings to create I would create a

million things. That is one use case right there that you can build in. Cloud

code could be able to speak all the thoughts and everything cuz I don't know about you but personally when I am

coding with a model I'm actually more more interested in its logic than the

answer. I find myself looking at the thought process opening that tag like thought for three minutes click let me

see what it thought ah this is wrong this thought is wrong then I can already deduce whether the answer is correct or

not so if it could just speak through now I'm thinking about this or just I don't

know find a way to find the most interesting things or summarize the thought process and and just

speak out think that would make collaboration much much easier. Well, especially if you can like reduce

the latency of like, you know, being able to like just have

very casually interrupt it and say, "Well, I don't know about that." Maybe think about it like this and then have

it uh, you know, continue. Like you can do all that with keyboard, but it's not fluid like you're working with the

intern that's sitting next to you or you're pair programming with this with this machine.

You should try our modular speechtospech pipeline. It does exactly that. Like one of the things I wanted is to the ability

to interrupt it. So I could interrupt it at any time and just say whatever I

wanted to do and it will do. Now the question is I want to be able to empower

developers and create the best SDK uh so that people can just integrate voice uh

into their products and pretty much all of their local solutions be it open

source or enterprise if they want to. Um, and this is what I'm working on and Marvis is a step uh towards that.

So, is that the the the uh the next big thing in your world, Marvis, or do you

have like big plans beyond that about how it gets like integrated into other things? I have big plans uh about how it
Future directions

integrates with everything else but I am I'm the type of person that is focused

on what I can offer and then going step by step. I already I already me like I

have probably the next three to five years of Marvis in my mind. But

I think the most important thing right now is getting it out of the door, getting people to use it, and then we'll

be able to do really, really cool things. We already I I don't want to say too much, but we already have really great examples of what Marvis could do.

You should be able to, for example, manipulate Marvis to have an actual agent that speaks the way you want it

to. Whether you want a Jarvis more relaxed way or you wanted a more active

way or I could just take all of your audience say, "Hey, sound like Sam in

terms of cadence, proity, everything. Just have a an agent that sounds exactly

like you." Um, I think that is important. Uh, for me in particular, I think I would love that. I I haven't

seen my family in a long time and I think having agents with some of some of my loved ones voices would be pretty

cool or they them having me which would be nice. Then I would annoy them

everywhere. That's funny. Awesome. So, we will uh

keep our eyes peeled for uh for Marvis updates and um get a a a link from you

as to where we can go to to look for that. But of course it'll be on X as well. Um, very cool. And you know, tell

me what else like, you know, beyond the things that you're working on personally, like what are you most

excited about in the the world of AI?
What’s next in AI

I think the most interesting thing right now is the direction that we are taking.

Initially it was all AGI AGI AGI but now people are realizing that yes that is

great it would be a great world but I want a system that is capable enough or

competent enough to have an actual intellectual discussion with me and tell me when I'm wrong

in a in a very reliable way. I can trust it. like I want a system that I can

trust and I I feel like we are moving towards systems that we somewhat can

trust. There's so much backlash to you're absolutely right. This came up in an

interview I just did. people are realizing that uh actually we want something that's going to challenge us

and like help you know work with us to like produce better things or you know

think better about the thing that we're asking about. Exactly. I I have a tweet where I say I

I said uh uh two  hours ago I'm waiting for the day it will say you are

wrong here's why delivers facts with sources. Um, I want that. You're absolutely wrong.

I I I think I want that. I I don't want a system that is just like, "Ah, you're right." Or, "Oh, uh, it's my bad." My

bad. What? You actually right majority of the time. You just have this tiny bug here, and I want you to just fix that

one thing. Um, so that is one direction that I'm I'm I'm loving to see uh

companies take on. So they are trying to build new architectures and new training

strategies to be able to address that. Uh second thing is media models. I think

um of over time the same way last year when I created MLX VLM there was

literally very few vision language models but nowadays vision language models and including audio models can do

function calling. So you can do function calling with your voice which enables experiences like Marvis. um you'll be

able to do way more with new types of media. So I'm seeing a lot of interest in uh audio space. Uh I'm seeing a lot

of interest in uh the video and um lip syncing space um as well as new like

generation of images. I think going towards a world where newer models can

do all of those modalities in one and they and and it can do in a very reliable way and efficient in the sense

that it could be you could get a  billion parameter model or  million parameter model that could do a few

modalities and you can embed these directly into your products and make your life simpler. Um to kind of

illustrate this before Gemma N the modular speech to speech pipeline

you needed ASR and you needed um a language model. Now with Gemma N you

could replace the first component and the second component into one

and actually third component which is multimodality with vision. So you now have one model that does audio

understanding, does text and image. Now imagine if you could also do um other

types of uh processing allin one or even output audio as well. So now you can

simplify your pipeline and your model can your entire system can just run much faster because you're not loading all of

these individual components and try to mesh them together. So I I see media

models becoming something pretty great and I intend to pioneer that at least

when it comes to some Alexa. I really want to have people uh do this in the best way. Uh to add to this, I actually

have a challenge with someone uh Julian challenged me in Germany last month to

create a package that's able to generate images and and and video uh in under 

seconds with a few gigabytes and I'm taking on that challenge. So look up to

that as well. And the goal there is something along the lines of Sora or Veo or

Yeah. Uh, okay. But but it runs completely offlineally run. Yes. And locally.

So I really want to do that. Yeah. I want to do that. I think the world is going to benefit a lot from it.
And who knows, perhaps the the whole uh equipment here for the audio because for
the studio might be replaced in some videos. I might just take a copy of me and make and make a video, a generated
video and say, "Hey guys, at least I thought it through. I made the script and you guys can watch something pretty
uh new." That's awesome. Awesome. Yeah. Well, Prince, it was great chatting with
you. Thanks so much for jumping on and talking a little bit about uh what you've been up to and uh
how the MLX ecosystem is evolving. Yeah, absolutely. Thank you very much for having me. Thank you.

Ressources:https://blaizzy.github.io/fastmlx/https://github.com/Blaizzy/mlx-vlm
https://github.com/Blaizzy/mlx-embeddings
https://github.com/Blaizzy/mlx-audio
https://github.com/ml-explore/mlx-lm
https://mlx-framework.org/
https://github.com/ml-explore
https://www.sesame.com/
https://github.com/ggml-org/llama.cpp
https://www.arcee.ai/blog/meet-mergekit-v0-1-arcee-fusion-expanded-model-support-multi-gpu-acceleration
https://arxiv.org/abs/2503.04872
https://huggingface.co/blog/starcoder2
