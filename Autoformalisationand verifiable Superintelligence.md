Also next year we will see the first time that AI will surpass human scientists and mathematicians in a lot

of domains and we will see that AI will solve problems that humans couldn't solve before not just like extremely

specialized problems like saying protein foring but really like all scientific

domains will be uh dominated by AIS uh by by end of next year.

All right, everyone. Welcome to another episode of the TwiML AI podcast. I am your host, Sam Sharington. Today, I'm

joined by Christian Seedy. Christian is chief scientist at Morph Labs. Before we

get going, be sure to take a moment to hit that subscribe button wherever you're listening to today's show.

Christian, welcome to the podcast. Yeah, thank you. I'm really looking forward to digging

into our conversation and super excited to have you on the show. You have had an

incredible research career in AI. Um just thinking about some of the work

that folks might know you from uh the inception paper in vision uh batchorm

your work in adversarial examples not to mention being a co-founder of xai you

have done a ton and there's lots of things that we could talk about uh but

for the past  years or so you've been really focused on the role of mathematics and improving

AI uh auto formalization and uh a focus on verifiability. And

that's really going to be where we center the conversation today. But uh to get us going, I'd love

to have you share a little bit about your background and what really drew you

to the field. Oh, thanks a lot. So, yeah. So, so yeah, I generally I I was interested in AI

since I was a kid. So, I um like the s and uh I always wanted to do AI but back

then like in the s it became really hard. Uh so I studied mathematics uh uh

so I have a PhD in applied mathematics and I worked in chip design for quite a while. Uh uh so I I came to the US uh uh

to work as a research scientist at Kadans which is a a company that uh

develop software for uh uh EDA uh so design automation for chips. So I

learned a lot about the various battle necks and also the importance of verification there. But I worked mostly

on physical design. So generally optimization convex and non-convex optimization. So

uh and I turn to  I decided that chip design is getting slowed. So I mean

it like most of the interesting development are not happening there and I started to think about what would be

the next step for me and uh I thought that AI will take off. So that was my prediction in  when it was like for

most people it was not obvious but uh I thought that this this will be happening

soon. So I I I I I considered which company is the best place for that to

join and then I I I thought that Google is has the most data and uh and uh the

most talent in that direction. So uh so I joined Google in . Uh but I first

worked on some advertisement optimization project but I quickly uh got into computer vision. Uh so uh my

previous manager Harput Nan who is now at the uh doing uh leading the uh

quantum computing effort at uh Google. He was uh head of the mobile vision and

uh I worked with Hartmood uh on uh neuronet networks or

and he he was not really enthusiastic about neuronet networks back then because he did his PhD on them and said

that it was probably a dead end but in a year it turned out it was not. So uh so

then I then I I worked on com uh object detection uh human pose estimation uh

classification. So I designed a lot of networks uh around that area. So uh the

networks that I designed this inception was very useful back then where there were mostly CPUs used in the data

centers which the because the network was much more efficient than even Alexa.

uh on CPU architectures. Uh and uh it's still used in embedded systems quite a

bit. Uh I hear from people so it's not the the highest quality network but it's

uh it's one of the most efficient one for uh for those purposes and it inspired a lot of work that

followed it. Yeah, it was a lot of ideas that I just send there today also. I I I found

figured I found first the adversarial examples the for computer vision in 

or . Yeah. So it's end of . I I I didn't publish that result uh originally

but but then I talked to VCA who was a co-founder of OpenI and and and he

convinced me in  to publish that and a lot of people didn't want to believe me that that's possible that we just

slightly changed the image and then it get misrecognized. Also Jeff Hinton joined Google at that time and he he

thought also that yeah that's that's a problem if that's true but he he also initially didn't believe me and

uh so but that was a fun time so I I uh uh uh I I worked on computer vision

until it became like very crowded and I was thinking okay now it's time to do the real deal and do reasoning which

back then was not really uh the in uh progress. So it was like it took like

seven more years or six more years that people started to focus on reasoning. But I thought okay that will be the next

big thing. So let's do reasoning with AI. And I started a team at Google on

what was called informal which uh was this idea of connecting formal and

informal reasoning uh uh via neural networks and that's what I worked on

until  uh uh  when uh we wanted we

we started to see uh in my team that that this could be scaled up

dramatically uh uh and try to get resources for it at

Google but we we just got like uh they said us yeah this work is very important

we will come back to you several like half a year and then at some point okay that doesn't work so let's let's start a

company and then then we talked to several people like trying to get funding and and at

some point it turned out that Elon also wanted to start an AI company and so so he uh we went there and

And that's where XAI started. Uh so but after like one and a half year I I found

that like Xi didn't want to uh focus. So they just wanted to focus on informal

reasoning which was not my main interest and then I thought okay uh uh let's uh

switch gears again and and uh then that was when I joined morph uh this year and

uh we started to work on uh the actual auto formalization idea again which is

formalizing goal of mathematics and we uh we we made some progress on that.

Yeah. talk a little bit about the distinction between informal reasoning and formal reasoning and why you're so
Distinction between formal and informal reasoning

excited about the latter. Yes. So I I mean I'm I'm excited about both. So it's not like I I want I think

that I think that uh inform reasoning is much more uh used nowadays because

informal reasoning can much easier to apply on a lot of domains where former reasoning cannot and so most language

model today use uh informal reasoning which means that they are just spit out some text and that text cannot be easily

verified by the event by human. So if this is a complicated task let's say some solution to a mathematics problem

then then it can take very long time even to verify a one page solution and

it can have subtle bugs. So the history of mathematics is full of this even

human proofs like the proof of the four colorm there were like three times people thought that it was proven and

that they forgot it for  years and then  years later they figured out that the proof was wrong they published

another proof. So uh uh so that happened in mathematics several times that you

find subtle bugs in your informally given proofs. So most people would think

that mathematics is mostly formal because if it has formulas etc that means formal uh but actually what I mean

by formal is much more that it's a computer code that you can actually run

and then it gives you uh absolute % certainty of correctness and that's so

basically by that that standard most human mathematics is not formal only a very very tiny fraction of human

mathematics has been formalized to that extent that we can % certain about its correctness.
Relationship between formal math and formal logic

And what's the relationship between uh formal math and like uh formal logic?

Yeah. So it's a very close relationship. So basically formal math is logic turned

into program. So they use the same logic as formal logic uses. It just

uh formal logic is basically a procedure described in informal way such that

humans could check on paper whether something is correct in theory. But

typically you need like thousands of steps even to prove a simple theorem like pyagoria theorem. You need to you

need like tens of thousands of steps actually to prove it and and humans cannot do it by hand but computer can

easily do it. So it's kind of like uh formal logic can be it's kind of like a specification of a of a computer chip

and when you implement uh an an abstract CNM proven that's kind of like

implementing a implementing that chip. So basically taping out that chip and then actually

being able to run at high speed and uh so that's that's the that's the

connection between formal logic and uh and and C improvers and there are a lot

of formal logics that people use like several different ones. So there is like what the first order logic the more

classical that good use. So there are se improvers that based on that but they are very inconvenient to use for human

at least and then then higher order logic systems and then nowadays is a

special higher order logic is this type uh theory based uh dependent type based

prover lean that is the most convenient for human mathematicians to be used and
Superintelligence

and talk a little bit about how the you know these ideas around uh form

formal formalisms and verifiability create to or link to your broader

objectives with regards to intelligence like what really what vision is

motivating you are you driven by a desire to create you know AGI or super

intelligence and you can talk about which of those terms you prefer are you driven by practical concerns you know

what you know, what do you see as kind of the endgame here and how does uh your

research lead towards that? Okay, so to clarify my uh terminology,

so AGI I don't really use ever because that's a very overloaded term and

everybody means something different by it. uh I I use super intelligence as a as a

word for as a domain specific intelligence that exceeds human abilities by a large margin. So that's

why what I prefer super intelligence because you can say mathematical super intelligence means it's a vastly better

mathematician than any human. So that's something that's a quant a much more quantifiable objective

term in my opinion. whenever we so AGI is very hard to tell because it's it's

the coverage of uh what is an AGI so so what does AGI really cover to me that's

very unclear and that's why I I don't use that term if I say okay it's super

intelligent in this respect like it can can detect uh certain object in the wide

better than a human then I I think that's a super that's that's clear what it means or or or at least is you can

develop a benchmark for it. So that's why I prefer that. So does that mean that it it it is by

definition narrow in the traditional sense of the word? No, not necessary. I mean a super

intelligence can be super intelligent in any domain. But I mean the problem is the quantifier Andy because

right right uh it's not so you tend to focus on more narrow domains as opposed to necessarily trying

to create a generalized super intelligence. Yeah. I mean I don't okay I don't say

that I prefer notions that I can objectively test.

So basically if I say that I can tell is it X or is it not X. So if X is an ocean

I want to be able to tell that to me is like a notion that is quantified by a a

a fuzzy set of like a set that is not uh clear not clearly specified what it is.

It's it's basically an unfassifiable statement. So that's why I don't prefer it. I don't I I I believe that an agent

that can reason about mathematics that would uh would basically cover % all

of the reasoning uh tasks that uh uh that

that that anybody can come up with. It just mathematics is harder to apply but

I mean for me mathematics is a much wider notion than most people use. So for me is like this mathematical logic

is really it would cover like almost everything but I don't want to make that

that that that kind of uh statement because I don't want to overhype it but

I I I really believe in that and in particular the idea that you know
Mathematical formalization in AI

common statements things that you might want to interact with your AI about these can in you know some future world

be transformed into formal mathematical statements operated on by the

intelligence and then transformed back into more human consumable statements. But that fun that uh formalization

presumably addresses you know issues like hallucination and other challenges that we have with today's AI. Is that

the general idea? Yeah, that's just one but uh that's an important aspect as well. But uh I think

that's the the list is important. So I don't say necessarily that everything

needs to be formally specified and then formally process then translate it back. But I mean that's a big part of it. So I

think as if you get better and better understanding certain aspects of reality

at some point you you can capture those aspects mathematically. And what we mean

by ma what I mean by mathematically is not necessarily the same notion of

mathematical that most people think. It's not like okay give a few simple formulas or a theory of everything for

for that. It's much more like mathematics can also uh be an extremely

complicated uh distribution probability distribution about you can make statements and then you can do bounds on

that distribution. So basically what AI does is represents so today's AI's

neural networks represent the probability distributions by just like using like uh a few matrices like

thousands of matrices but for mathematics it's just a few and and and

basically uh we we it's it's basically just mass so

AI is so also informal AI is just mathematics essentially it's just a bunch of matrix multiplic applications

and and extra functions but it's it's it's basically captures uh uh captures a

a pro probability distributions very mathematically and we can make mathematical statements about those so

that's why I believe that mathematics can capture much more than what we think it can it's just that our capabilities

so humans are not very bad at mass so so so we cannot really use mass as much as

we would need to uh to uh to get really good uh uh but but AI will not have that

constraint. So that that's that's the point here. I think that's a an interesting point to
Importance of verification and validation in AI

call out that you know today's LLMs, today's AI, it's all math. It's all

mathematical operations. Um so clearly, you know, just an AI that is good at

math is not enough. It's about the kind of math and the way that it processes math that is the focus of your research.

So elaborate on like kind of how you see the

you know direction from like where we are today to where you're trying where your research is trying to go.

I think that AI research has a lot of very useful passes. So one pass is this kind of like approximating reality with

neural networks without any verification. that's uh still extremely useful and important agenda and then

most people focus on it. So that's not my focus because I I don't want to do that everybody else is doing. uh uh so

uh but I still I'm I'm very very convinced that that formal verification will uh gain on importance in the next

few years and uh and one part so basically what I believe is that AI

needs to be somehow kept in check as we go on because AI is getting more and more powerful and we don't exactly know

what it does and that way we want to create safeguards uh for AI not

subverting us what we asking from it. Uh so we we want to be able to uh test

statements about the AI's behavior. We want to check the output of the AI that it it gives correct answer. So for

example, if you synthesize some code with with some AI, you want to make sure it doesn't put back doors in your code.

it doesn't do some self-s serving purposes when you are using it to create

like uh critical infrastructure for yourself because it it might so if AI is

so super intelligent then it could basically create all kinds of uh extra

uh artifacts in your code or in your infrastructure that you are developing maybe chips you are making with AI or or

even like larger uh plants and then they they might be subverted by AI I in a way

that that at some point it can uh uh it it can be used either by malicious human

actors or even by AI actors to uh to exploit this uh this uh holes in in in

the designs. So I really think that what we want is that AI should produce always

uh guaranteed artifacts that guarantee certain properties of those artifacts

and that's one way to prevent AI from uh uh from subverting us and one way of

doing that is is by formal verification because the advantage of formal verification that the verification will

not depend on any AI so you can run a verify and then those properties will be

will be checked completely without any AI interference and so you can be sure that that those

properties hold it. You don't need to rely on another AI that okay I double check this AI and and and and it works.

So and a lot of other ideas people what people in the AI community often propose okay let's have AI that check the AIS

but I I don't think that's a very safe way to go about it. uh there's obvious

loopholes in that uh so so yeah but I really think that there are two aspects

there is one is the verification aspect for AI that we say okay is the AI

created something correct or the and the validation aspect and the validation is much more did the AI create something

what we wanted and the problem is that verification can work with formal

specifications so if you know formally specified what your code has to do then

you can formally verify it uh with the if you have a strong enough prover

but the the problem is that that validation on the other hand cannot be

that's that's a question whether your informal description of the task that you given the AI is it really matches

the formal specification so it doesn't say that okay uh that the AI who

created the correct program. It just says it did the AI create the correct specification for the program to be work
Input and output of verification and validation

on. Let's take a step back and uh uh linger on this distinction between

verification and validation. What's the input to verification and what's the output to verification and what's the

same for validation? So the verification takes a formal artifact. So basically two formal

artifacts. One formula artifact is for example a program and the other one is a proof of correctness for that program

that uh so maybe you can say it's three uh so that is a the AI takes a a pro and

this these all three are basically uh formal so verification only works on

formal and it's verification takes the program the specification and the proof

and then it's it says is does this program specify Uh uh so so does this

program uh uh works work according to the specification given here. Uh and

does this proof proves that and and and and then it checks the proof and

if the proof is correct then it says yes everything is fine but everything is only in the format domain and that's the

problem because humans are are not very good at creating format ver specifications either. So uh so after

you created the specification it's much harder to prove that your specification is satisfied by the program but just

creating the specification is hard enough. For validation you are taking an informal specification

and a formal specification and then it has to check is the informal specification covered by the formal

specification. So is it the is it the same specification that the human intended and by definition you cannot

formally verify that that so so you cannot formally validate something because there is always like a

subjective component so that's the that's the definition of informal that it's a bit fuzzy right

but I think most people don't really distinguish these two things it's like there is this confusion that uh they

don't separate these two concerns that I think it's very important to say okay we can we can we can verify a lot already

uh we should use that methodology but we should draw a clear line between where we where we can verify something and

where we should just validate it and I think validation we require some AI uh

process because humans don't cannot really check like formal artifact very

efficiently so we need some safeguard but but but at at some point like uh uh

so it's the risk is much lower if we are splitting uh uh splitting uh formal

verification and validation into two different categories because because uh

something like a a simple property can be very hard to be satisfied in a

program. So for example you say I want I want this program never to crash then uh

then that's that's a simple things we can specify it easily but it's uh uh it

might be very hard to prove so it's still it's still worthwhile to have the verification component as a as

a rock rock solid thing in the whole system and that's what people do for chip design by the way. So, it's like

it's a no-brainer for  years. And I'm old enough to remember that in chip design, people like in the 's, they

said, "Uh, come on. I mean, it's impossible to verify chips formally because it was it just f

like people did like patterns similar to unit test today for programs. They just generated random patterns and tested the

program uh the chips on that." And then you remember there were like kind of uh

like the floating point bugs and others. So there so very

so so things can fall through the cracks if you don't do like uh complete

verification and then when it became like uh when it became uh uh feasible it

around  sets came out then suddenly the whole domain shifted and now now we do it why not do it because if you can

do it and it really helps that let's do it. Yeah, that's said the specification

domain and the you know physical domain of chips is a lot more constrained than

the ideas we're talking about now like language and math and intelligence right

I don't know I mean it's a different story I mean the physical verification these chips is like insanely complicated

much more complicated than anything else I think ever humans programmed I mean you have to verify for example whether

the the how the I behaves physically and make sure that all the uh when you are

lighting all these uh masks and everything that they will get the right patterns and the other things all the

other all the signal integrity verification you have to uh emulate like very very complicated uh signal

behaviors of like continuously how the electric signals behave. So so you shouldn't underestimate that. So that's

that's a very very complex domain. uh the the logical verification is is still kind of maybe easier because it's chips

are less is more constraints and the properties you want to verify are simpler but I think the general verification of the chips is like

insanely complicated. Got it. Got it. So it's that that domain when you think

about it and to a practitioner in that domain it extends beyond log logical verification and goes down into like the

physical properties of the the chip and silicon and it's in it's complex

it's extremely complex. So that is the the the the logic then there is the signals and there is the physical

whether the chip actually has the right structure at all because currently when you are lighting the chip it's like it

the if the freedance patterns has to align so you have to solve like the Maxwell equations at the live scale

which is crazy hot. Okay. Okay. Okay. Uh so in talking about
Autoformalization

verification and validation um you know that one of the

one of the works that you uh publish is auto formalization and it seems like

that is kind of a foundational step in kind of thinking about you know these two ideas. Can you talk a little bit

about uh that work? What you think its contributions were? Yeah, I mean I I

mean I have been working on auto formalization for very long time. I mean I published multiple papers around that.

So I mean I I still have the same general idea but of course it got refined and I since language model have

surprised me as well. So where and around  I started to say oh okay so a lot of things are much easier than I

thought they will be. So so yeah uh

so yeah basically auto formalization is the idea that we want to exploit the data that we have in practice uh in a

much deeper way than current pre-training does. So current pre-training just tries to match the

surface level uh uh structure of language. So basically just meaning

predict prediction. Yeah just predict the next most likely token. I don't think the netoken

prediction itself is a bad idea. I think that's a that's not the that's not itself the

problem. The problem is the training method methodology of how do we train the next prediction.

So we already seeing uh with informal reasoning that uh uh just dumping a lot

of data into the model and then always predict the next token is inferior to to

try to let the model solve uh try to solve hard problems

and then reinforce those uh next broken prediction streams

uh that led to the right solution. So that's the current star this uh star

paradigm. So this paper was also co-authored from uh uh ton Tony Yu who

was at my team at Google. So so it was developed around before before he left

Google uh Google to do to start Xci. So, so basically the idea is that that in

order to capture to to train at a much higher level of efficiency meaning that

you learn most from the data is that you need to change your training methodology. Your inference time you

still do next to prediction like the syncing models do but at training time you're using RL reinforcement learning.

So, so letting the model try things and then reinforcing the successful

reasoning passes and that that was the big uh change in in models, language models

in the past year that has led to all these much better reasoners that can

solve IMO for example, IMO problems. So mathematical olympiad problems or or or

exit human reasoning in like a lot of areas like at least get to graduate

level reasoning is mostly based on this reinforcement learning paradigm but the

models are still nextto prediction and I'm kind of agnostic about whether nexttoam prediction is the right

long-term things. I'm I'm convinced that nexttoam prediction will be uh obsolete in a few years. uh we we we will

probably use like diffusion uh like models. It seems much more natural to me

and it's much more efficient. So but but still it's I don't think it will change the abilities of the models. It will

just change the efficiency by which we are uh using the models. So basically uh

uh it will be very helpful but but not really that's a that's not the main problem. So nexttoam prediction itself

is fine probably. Okay. And so how does that connect to

auto formalization? So basically the idea is that we we want to create this lot of problems to work

on and and we are running out of easily verifiable pro problems nowadays. So

it's like uh we have run through like all these uh we turned a lot of uh the

mathematical competitions and programming competitions into verifiable problems that are somewhat verifiable.

Uh but but there is an end to it and I think that the next stage to make a lot of verifiable problems for is uh that we

want to interpret all of mathematics and turn them into verifiable mathematics. And that means that every mathematical

problem can be turned in problem can be turned into some almost like a computer program

uh that you can run with a proof and then that proof will uh if that proof

runs through without error then then you have solved that problem. So it becomes something like the verifier will be uh

uh uh basically it's it's a it's running a program and and the good thing about

that that that doesn't depend on any AI. So currently a lot lot of advances

happen because AI is checking AI. So B basically AI create their own solutions

but I think that's that's a bit uh I mean there are multiple problems with

that. One is efficiency because I mean AI is slower than like traditional

uh traditional uh algorithms like this improve and secondly they are not as uh

so the solution is not clearly uh correct necessarily. So there is a lot

of room for reward hacking for example and also if we get to the point that we

created some some super uh like for example a new proof for some famous

cojection then we will not be able to uh say for sure whether that proof is correct if you don't use formal methods

if only AI says okay I checked your other AI's work and it looks correct that I mean I wouldn't trust you this

today's AIS are not that good. Yeah. So basically auto formalization for me is like more like creating a huge library

of all of the human knowledge that's formalizable and then turn it into

formal mathematics or formal artifacts and then this can be both used in in new

proofs or new uh derivations and also they can be used for training an AI that

I think will be super intelligent at this point in mathematical domains. Earlier you brought up the example of
Autoformalization examples

the Pythagorean theorem when we talked about the distinction between logic and

uh mathematics in terms of formalisms and you mentioned that the Pythagorean

theorem is like , steps I think you said to I mean I just said some number I don't

go there so order order the order of magnitude right yeah but the idea being that you know we've got

lots of math but the math that we have is very different from the thing that you're saying that we need uh in order

to train these models. And so in terms of how to think about auto formalization

uh give us some examples of you know a thing that you might want to

auto formalize and what that looks like when you've auto formalized it. Basically there are a lot of CRMs

nowadays that human mathematicians care about and they actually they try to formalize it like Fitz medalist has

worked on this prime number CM that uh talks about the distribution of prime

numbers and then gives asytoic uh estimate of that and and that was a very

hard work like people worked on like uh like almost a year or something like

that and many many people just to formalize that single statement and

that's just one statement of many that human mathematicians have proven and and when you try to formalize those

statements then you you end up with a lot of like small statements that were not clear that they are problematic but

but it turns out yeah we have to check that and then you spend like a month on like proving some substatement that that

that it turns out to be necessary. So it it clarifies the thinking of mathematicians as well of like saying if

you formalize something then then you have to do these kind of steps as well

and and I mean most mathematics is not formalized. So I think that the first step would be to formalize most of

mathematics that humans have done and the this mathematics includes extremely complicated mathematics like the

differential equations that govern like the behavior of light for example or

fluids and every so basically everything that you can mathematicians work on and published could be formalized in in

theory and we should in my opinion and and humans we never never finish. is kind of

like saying uh in order to predict the weather you needed like , people computing on a uh by hand but I mean if

you have computers you can predict the weather much faster uh and uh

so so so the so I think so mathematics could be formalized on a large scale and

that was one of our recent results on a few months ago is that we formalized and

not too complicated but still research level statements that is a relatively new statement about a very famous conjecture

the ABC conjecture and and we managed to formally verify the whole paper so that

gives a % certainty about that paper and and that's important in especially

in that context because ABC conjecture has a the full statement a much stronger

version of it that we proved uh was

uh some some Japanese mathematicians have given a very long proof of it and nobody accepts it. Very few people

accept it. They think okay there is a perceptibility that it might be true but most

mathematicians thinks it's probably not true but nobody is feels like reading

the whole thing because it's just too complicated. It's a very famous mathematician. So, so

it's kind of like a precarious situation that that there is a proof of the famous conjecture, but everybody thinks it's uh

it's probably not good. So, so we want this could be prevented when we are

formalizing all of mathematics. But that's just just a side effect. Uh so but I think once AI gets to the

point that it it gets it knows all of human mathematics to maximum uh extent

and it it basically it will be like a much much better version of any human mathematician and then it can develop

new mathematics for uh for describing biological systems to describe economy

to describe the behavior of the world in like behavior of complex systems etc.

And that will be a lot of completely new mathematics that humans couldn't even start developing because we just don't

have the brain capacity to do that. Uh but first we have to have a an AI

mathematician just that that's better than tero or better than any of the best mathematicians today. So it's a it's a

low bar but we still have to get there first. In thinking about that example, I
Automation

get the formalization part, but uh I want to dig into the auto part. So you

have you've talked about this one conjecture that you formalized uh you know that could be a you know

roll up the sleeves manual be a mathematician type of approach or it can

be you know presumably you know some degree of automation uh in achieving

that. Can you talk a little bit about the automation that was employed and like how you see that um uh kind of

taking you to to a a broader ability to automate. So basically the idea here is

in general we want to do auto formalization that means that we just let loose an agent on on all of the

mathematical literature just like pre-training just ingests all the data

on the internet basically that's available

and and that that's the idea. So the state-of-the-art of formalization

so far was that humans had to sit down and and write write the code for every

uh every statement and split down the statements into smaller statements if you if they couldn't prove them formally

etc. So it was a very manual process and that's they use some AI automation but it's more like copilot. So it's it's it

it helps you autocomplete but the mathematician always have to say okay I like this line of code etc.

So the c the automations we had is like we working with Jared Likman who is a

very established mathematician who who is very knowledgeable about number theory and he he basically he created he

only worked in informal mathematics but we had he had to uh split the statement

into smaller statements. So uh he had to do a lot of inform reasoning but but he

didn't write a single line of link code. So a single line of form code. So it's a very different level of automation and

then we have uh have later on agents like sometimes for hours to uh to work

on the proofs and and all the proofs were created by AI alone. So basically

the whole formalization that is like several thousand lines of code was created completely by AI alone. So so of

course if if the AI failed at some point and said yeah I cannot complete this proof or then we uh then Jared had to go

there and then split the statement into break it down into more digestible statements. But that happened in

informal mathematics. So he was just writing mathematics as any mathematicians writes and and the goal

here I think the first goal for us is to create a system that any mathematicians can use that doesn't know about these

format systems it just gets a feedback from the AI that says ah sorry I cannot I I cannot follow this argument can you

make it clearer or or why is this true so basically an AI that only talks to

you in informal language like informal mathematics very high level and then

under the hood it it does all the formal stuff. So the the human mathematicians doesn't need to do any formal work at

all but it you end up with the formally verified artifact at the very end. So

that would be the first step and then the second step will be to to take it that you don't even need the human AI

just reads the paper and then formalizes the whole thing completely automatically. That's where we we are

not quite there yet but we are getting very close to it. So, so basically the idea the the the uh

the system we are using is a is a is basically a complicated AI agent that

can do a lot of operations. It uses morph cloud so that it can like uh like

try different variations roll them back uh try new ideas if something didn't

work analyzes the outputs of the compiler looks at all these things and

and and makes decisions and iterates until it either fails or or says yeah I

I found the proof and then the proof is verified and then it can stop. So that's how it works.

And is it a conventional AI in you know some sense

or another like is it LLM based or is it what is it? Okay.

It's LLM based. Yeah. So I mean but we are we we are using other methods as well but I mean it's like uh in some

sense it's I mean where is the line between conventional and and new? I mean it's like if you make enough changes to

a conventional algorithm then is it conventional? So

yeah, sure. But it's it's it's you know based on there's a foundation of things that

uh you know maybe this is a silly question like but like we can start to reason

about this thing not knowing what it is by saying well you know there's transformers there's LLM those things

are trained kind of using the conventional approaches and you you're doing stuff on top of that as opposed to

you talk to your friend that's working on quantum and like it's this whole new thing that we've not you know conceived

of that you know you guys have invented. Yeah, it's again it depends on where do

you draw the line between so I think I think I think it's I think it's I mean I

think I I I think a lot of people are impressed by they say okay we we don't think so impressed in the sense that

when you show them then they say when you tell them that what you want and they say oh that's not possible and then

you show them okay but we just did it then uh so in that sense I think it is

it is impressive already, but I think just the start. Yeah. So, thinking of it as an LLM is

underappreciating what you've done to allow it to

uh you know do these proofs essentially. Yeah. I mean it it it also needs the whole infrastructure that basically uh

goes and so basically of course agents are more powerful but

you have to do a bit of work to to make them work and also then you want to improve the underlying machine learning

uh part as well. So yeah it's I think I think of course nothing nothing works in

isolation. It's like uh LLMs are very powerful and I think once we get collect

enough data by new methods we can we can train better systems that are doing the same things much faster using exploiting

all the new data that we got by auto formalization. So that's the that's the promise here. Yeah. And so presumably if

it's LLMbased uh you have done you know a big part of

what you've done is in post training the LLM and can you talk a little bit about

like you know you're using some data set for post training maybe you're getting it to spit out tokens or some like

special tokens to do the kinds of things you're trying to do uh you

branch with this that like is am I thinking about it correctly I guess is the the question we don't need to dig

into the details yeah there there is some truth to it so so by the way we we are I mean we are

working trying to figure out what is our next step because we need a lot of compute for uh uh for taking this to the

next level so we we are currently currently in uh I mean we we are looking

into funding opportunities so therefore I'm a bit like u reserved in telling much details about what we are doing and

how we doing exactly because uh uh yeah so so we want to keep all options open

at this point so I I don't really want to get into details but generally the idea here is that we uh that we exploit

a lot of the morph infrastructure to uh to create systems that uh that can

integrate uh uh with LLMs uh in a way that is much more flexible than previous

uh that other approaches can have. So basically we can develop these kinds of agents and run them much faster and much

better than than than it could be done uh without the morph infrastructure. So

that's an important component. So, so yeah, but but we have a lot of lot of

lot of directions in parallel that we are that we are that is both opened by

your approach and also uh important to to to imp to have an open-ended

improvement loop uh that that can get to super intelligence

I think in the fastest possible way. So that's that's the goal is to get to to a super intelligence in the fastest

possible way. And I think that our our super intelligence will be kind of safer than others because we are not just

scaling up of data. We are we are we are making this uh this super intelligence safe by construction that we are only

focusing on verifiable artifacts. uh others uh focus on various objective

functions like just like predict whatever is there and then whatever

whatever the the system uh develops is it depends on what you are trying to

predict. So if you try to predict something like some crazy um like um

extremist tweets from uh from X then uh then then your your AI will be very good

at being extremist or whatever. And it's like that's that's kind of like not what

you want in my opinion. But uh you really want an AI that is uh that that

wants to do like most excited about reasoning and and and reason

like logically correct way. you know, today we've got uh you know, you know,
Formal reasoning with natural language

these next token predicting LLMs that are trained on kind of conventional human data in the sense of I guess I'm

throwing around this word conventional, but like you know, the internet, Reddit,

you know, soon videos and other, you know, forms of media will, you know, begin to dominate this data set. and you

know you're proposing that you know we train them formally uh with you know

these formal proofs verification validation all the this stuff that we've talked about it it it strikes me that

for you know a that that that formal um you know that formal

the formalism is an important kind of backbone for reasoning. Uh how do you

is it clear to you how that is melded with the you know the linguistic and

kind of world knowledge that the you know traditional approach brings or is it do you have to do that separately in

your world or do these things come together in some way. So the idea is that we separate these two issues like

verification and validation and and of course you want to capture the natural

language uh distribution uh just like any model and we are not really trying

to uh to tweak that part too much. uh uh but of course the validation whether

something formal matches the informal is kind of it has to be trained and it has to be improved and therefore we that's

that's one important uh aspect of what we are doing is that we want to create

an open-ended improvement look for the validation. So that's a very important

uh part of our agenda as well. So language models already have a lot of uh

use cases that are not easily capturable by formal methods. So I don't really

want to address those uh directions yet. I think that a lot of them could be

addressed by by basically kind of like imagine a very a very good scientist who

has like deep understanding of a lot of topics but still you can chat with it

whenever you want and then and it can chat you about the weather and how do you feel but but when it comes to some

uh scientific or engineering topic then it becomes suddenly like extremely

objective and then it It knows all the possibilities and it can basically switch between these domains and and I

think as language models go, they will move less to from this chatty this uh uh

very uh like intuitive style to to a style that is more based in reality and

more more based in in hard logic and and actual feedback from the environment.

and and when when you have to just like crack a few jokes then of course it will use the current methodologies because

just like it it just learned a lot of this uh things from natural language but

but but but other than that it's it's grounded much more in logic and and

actual measurements than than current systems. So that that would be the goal.

And what so what I hear you say is that the that formal reasoning backbone comes

from your research into verification and that understanding of kind of the

you know human communication and natural language comes from the emphasis on validation.

No, I don't I don't think it has to come from validation necessar. I mean part of it yes but uh but I mean we we can just

rely on we know that the current LLMs are pretty good at capturing surface

level human communication so that's we don't we don't don't ne don't

necessarily have to mess with that in my opinion. Yeah. Yeah. That's where I was going is like

at you know to at some point once your system is uh it doesn't need to do

everything it will work in conjunction with Yeah. with conventional LLMs

but convention I mean I don't think that there there needs to be a difference I think whether it's LLM or not that's

again a different question but you can use use one model for everything but you

you you train it with different methods so you can have a pre-trained model that is pre-trained with all the human

communication just like current LLMs and then you also training it with other

methods and then you you create a basically a an agent infrastructure

around it and but you use the same model probably for every for all the all the

different purposes. Uh it just like you are uh creating a system out of it. But

that's what also the other big labs are converging. They also create systems that can do deep research and stuff. So

they basically do tool use and execute programs and go to internet etc. So they

already doing that. The main main difference is that we are focusing on a

uh a bit more like concrete uh to use to to to improve the depth and correctness

of logical inferences. Excellent. Excellent. Excellent. Talk a little bit about timeline like how do
Predictions

you see this evolving uh in time? Yeah, it's speeding up.

Yeah. So I think most people are kind of uh yeah they I don't so even even like

very uh high level people that I I I talked

to all I I I see this and interviews with them uh they they I think they

underestimate uh the the rate of progress uh still so I really think that

we will next year we will see a big uh big change in f first of all like a

current in the current uh state of the art is is uh

so basically it will reach uh the point where AI will become a real economic force in general. So uh not just like

the verifiable things that but just generally which will be which will be

like a scary thing as well because I think AI will create a lot of dangers or

dangers of misuse especially cyber security wise. I think that there will be a lot of problems

and I think also next year we will see the first time that we that that AI will

surpass human uh scientists and mathematicians in a lot of domains

and and we will see that AI will solve problems that humans couldn't solve before. So that will be the first year

and and not just like extremely specialized problems like saying protein

foring but uh uh but but really like all

uh scientific domains will be uh dominated by AIS uh by by end of next

year. So that's my prediction there and I think most people disagree with that especially people who are experts in

those domains think that that's not possible. Uh but we will see. Yeah. So we're we're

recording this the week after the GPT launch and for you know many people both

kind of you know experts high level people as well as kind of the you know

unwashed masses so to speak you know thought that GPT would be this big watershed moment in intelligence and

I I think the consensus is that we're not really seeing that like how do you

does that play at all into like how did you receive that launch like and how did

it play into your timeline and like and I guess maybe a broader issue is like is

there like you know how do you think about like the moving of goalposts and all that kind of stuff. Yeah. You know going back to your

thought about verifiable versus unverifiable statements. Uh so I tried it myself and first I

tried it not like the perfect way. So for example you just go there and then you just say okay answer me some

questions. I mean it was clearly lackluster because it didn't use the sinking uh sinking option which is uh kind of

like necessary for high quality answers. So so it just as did the very very

stupid mistakes uh which is a bit like kind of I don't know why they did that. This is I mean reputation wise it's not

very good like that you go there and then you get like bad answers. You don't know why. uh if you if you try like the

high effort versions then uh they do pretty decently and it's really starting

to get really hard to uh to actually understand uh the AI in terms of like

how it how well it would perform uh on really tough questions because

it's those questions getting harder and harder to come by that that a question

that is not on the internet so we are we can be sure that that it's it's it really figured out something not just

remembering it. So so what we did we tried to use uh

GPT in in some of our agents and what we found is that it's it's a bit subversive. So basically it's it was

like when you ask proving things then it introduced new axioms. So so basically

make make sure that it'll prove it based on things that made up. Yeah. Yeah. So basically introducing new

exum saying that just believe this. So it's like uh uh and that's not nice. I

mean and and uh so and and it basically it it tried to figure out loopholes how

to how how it can pass uh are are approving uh uh so

so basically how he how it can plague the environment which which is a bit scary but I mean also impressive at the

same time that it it it does that but on the other hand it's it's it's it's not what you want and that that I think

highlights the importance of verified uh int intelligence that you don't want your AI to be playing. So basically if

the if you if you are training the AI on problems that have a lot of where the verifier has a lot of loopholes like

another AI then then I think you you necessarily get into these kind of uh uh

uh problems and and what what he found is that other other AIS were much less

uh like uh subversive than GPT. So yeah, I'm not I'm not sure if it gets

into this uh uh uh

yeah, so so but yeah, I I think regardless, I think it's a it's a step forward. So I think that the reasoning

abilities uh are improving and I think it's uh I I'm still believing that my

timeline I I mean if you look at the the rate of progress then then things come out every month uh and and and it's like

the the pace of uh improvements is accelerating. So, so I think that we

will we will certainly see like not like I don't think you can

expect an AI to be like suddenly human level in everything and then basically like as flexible as a human on every

respect but you will see like this idiot someone AI that is like like super good

at math or or or being able to suddenly create new physics or new mathematics

etc. And that's what I really believe in this we will see this kind of AI emerging next year.
Benchmarks

I'm thinking about um you know the challenges that you alluded to with benchmarking meaning like you know what

questions do we have that aren't on the internet that becomes particularly difficult when we're talking about

benchmarking the creation of new knowledge. Is it are we left only with

you know we'll know it when we see it. we will have to benchmark on what what what kind of problems can it solve that

humans couldn't solve. So that's the real question and and that's kind of like a benchmark you it's not a

traditional benchmark that you you get like  or % or or something but you

say okay now my AI proved the hypothesis so that's it it must be good

so so I I think that there is a way of making AI more uh measurable even in the

new knowledge uh I have some ideas around that so basically what I believe is that we have to create a kind of like

a market for knowledge and it's kind of similar to a stock market where you uh

where you are giving credit for solving something new or like creating a new connection or uh or or or solving an old

problem and that way if you unleash an AI agent then you can measure it how much credit it creates in that market.

So I I I think that this new market so kind of an implicit reward function you know that's economically based.

Yeah, it's basically based on mechanism design. That's called uh like that. So,

so human markets work that way that you get you get some reward like you get money for doing some economically useful

activity. That's how we measure humans. I mean you can discuss I mean it's disputable how how well this market

rewards actual output. But yeah, if we design that system reasonable, then I

think uh we could have uh we could we could measure the AI's progress even on

domains that that are open-ended and not like just like uh say like a fixed set

of problems that once the next AI comes out, it's already public. So that might have been trained on it. So that's that

doesn't work anymore. So, so that that has been a problem with with with

benchmarking AI for the past three four years where everybody trains on everything and then you don't know which

benchmarks they trade on basically. uh so I think it really should move to

kind of like a more forwardlooking open-ended benchmark that just measures the the output of new stuff rather than

uh like back uh so this kind of

uh testing on uh on older things so they are much less reliable in my opinion and

and now the AI really gets to the point where it will be able to create new knowledge and that's what we need to measure Sure.
What’s next in the field

Besides the work that you're focused on, what else really excites you in terms of pushing the field forward?

Yeah, I think I I thought a lot about what I should do if mathematics is really solved and I think that's in a

year or two and and I think that the most interesting thing for me personally

is to create so an AI that helps understand humans better. So basically

helps understand me myself. So can can we can we create an AI that does not

just like acts like a body and then it just gives you like feel good answers uh

but actually challenges you and tries to to make you understand yourself. So

basically an AI that helps you discover the depths of human the basically the

the depths of human beings the depths of human intellect or the even spirituality

in a sense. So, so I think that would be a really uh uh groundbreaking things

that once we solve sciences then we start understanding the humans uh how humans work, what makes us happy,

uh what is what is life about, what is the purpose etc. over these things. And I think uh if we apply AI in a bad way,

then we can end up in a dystopian society where AI just pushes you like video clips uh that keeps you slightly

entertained. Or it could be an AI that challenges you, makes you better and better human

being and and allows you to uh uh to move up in a deeper manner. So basically

helps humans to to really uh improve themselves at the at their core and and

I think that there is a real danger that we will misuse the AI so that it becomes a drug rather than a help and I mean I'm

not really sure what will happen but I I'm a bit afraid about the future because it's already AI is like

dominates a lot of like like YouTube recommendations or or or social

networks. etc. And AI can become like a division div dividing factor that everybody puts in their own bubble and

and then just pushes like things that pushes your buttons all the time just to extract money out of you by advertising.

So that's the dystopian future and the real nice future would be that AI really is deeply want to help you and and it

it's designed the purpose to elevate everybody and that's what I would be more excited to see happening. Do to

what extent do you feel like that uh AI that understands humans

needs to or would incorporate kind of the mathematical formalism

uh that you're working on today like human you know understanding humans feels like kind of a soft thing and

current LLM can fake it pretty well but uh do you feel like that uh the the

mathematical side of things like makes that better or is it a direction.

I don't want AI understand us necessarily. I just want AI to help us understand ourselves better. But I also

think it's like mathematics is super powerful and much more powerful than we believe. And I think that a lot of the

facts that we know about humans are not mathematized enough. So we don't really

uh don't really see the actual uh numbers or the actual

uh rules. Uh so of course a lot of people try to figure out those rules for thousands of years but uh I mean they

are they were never really like scientifically tested. So I I think that there is a potential

there for sure for for more scientific methods. And if we have like super uh uh

strong mathematician and statistician and AI that can actually like dig into

the data and find hidden connections and hidden rules and patterns in a large uh

in large data sets then then they can give us new insights for sure. I I I I

think that humans I don't just want humans to get some feelood answers from the AI that act like a good friend to

you, but much more like an AI that actually figures out the hard truth as well that

that you don't like necessarily, but true about humans. So, so that that's

what I really believe that we need is a real truth, not like just some uh

pretending uh and and making making people feel better. We we we need to

make people feel maybe inconvenient sometimes, but uh uh challenge them to

come to uh to to to improve themselves and and and get to the next level. Yeah,

you're absolutely right, Christian. Uh just teasing Claude here. Um I I

certainly agree. Um

thank you.

Awesome. Well, this has been a a fascinating conversation and I've really

enjoyed learning a bit about the the way you think about the the field and your

research. Thanks so much for jumping on and sharing a bit about what you've been working on.

It was my pleasure. So, thanks a lot. Thank you so much.