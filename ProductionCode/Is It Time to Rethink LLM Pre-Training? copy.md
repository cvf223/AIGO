Introduction
You know, we measure performance on a benchmark. And if that's all we care about, it
seems like we can do really well because if you collect data that
looks like the data you want to do well on, you can just, you know, throw a lot of compute
at it. But like does that
actually solve the task if we, you know, just test it in a slightly diﬀerent way that is also
meaningful from a
deployment perspective. But like when does that break the models and why does that
happen? And how does the you know the training dynamics or the data
curation like what aspects of these actually influence this behavior and what's the right
way to intervene and
make these problems you know go away.
All right everyone welcome to another episode of the Twimmel AI podcast. I am your host
Sam Cherington. Today I'm
joined by Aditi Ragunathan. Aditi is an assistant professor of computer science at
Carnegie Melon University. Before we
get going, be sure to take a moment to hit that subscribe button wherever you're listening
to today's show. Welcome to the podcast, Adi.
Yeah, thanks for having me here. Excited for the conversation. I'm excited for the
conversation as
well. We are going to be digging into one of your recent papers which won the
outstanding or an outstanding paper award at ICML . That paper is called
roll the dice and look before you leap going beyond the creative limits of next token
prediction. But more broadly, uh,
your lab has been really digging into some of the limitations of current LLM
architectures and opportunities and, you know, what we need to understand to
better make use of uh, of AI models and I'm excited to talk through those with
you. Uh, to get us started, I'd love to have you share a little bit about your background
and, you know, what got you
excited about AI and machine learning. So I guess in my undergrad I was you know
always excited by complexity theoryand I really liked the elegance of thinking about what's possible and what's not. But at the
same time like
maybe like several others I also had the itch to work in something that had immediate
impact was practical and when
I started doing research was around when deep learning was really taking oﬀ and this
was you know post
imageet and so on and so naturally I got excited about it but really the you know the
moments that shaped my thinking
around this was when I was at Stanford I was attending a couple of talks and uh
one of them was on adversarial examples which showed me how these really capable
models can also fail in spectacularly
kind of surprising and maybe seemingly dumb ways and and they also had some
immediate you know practical questions around security reliability in the wild and so on.
So that's sort of what got me
thinking about like how do we think about you know these really capable systems that
also have these failures
and it also tied into my itch on you know complexity and think about abstractions and
making precise statements about these things and it
kind of felt like a nice combination because a lot of these aspects cannot be captured by
just specific numbers and a
benchmark and really need to go one step beyond to think about how do we you know
what do these models learn when do they
work when do they fail and so on. So that's sort of what got me into all of these questions
and of course the
field's really been changing rapidly and so I've kind of gone along for the ride and uh and
what's kind of interesting is
that progress has really you know models have become very capable in a lot of ways but
some of these fundamental
failures still remain and so we can keep asking the same questions about various diﬀerent
models and maybe it's also
sobering that it's not that we've actually pushed the reliability as we have pushed the
capability of these models and so in some ways the samequestions have remained over time, but also a lot of the context of these questions has
been changing.
It's pretty spectacular what we can do with the models and yet we're still talking about
not really understanding
how they work and how it's a little bit of magic. Yes, absolutely. And I think the part that's
also concerning is when this lack
of understanding becomes a real issue when you know when people think about getting
models to be safe in some way to
not utter toxic content or to release dangerous information to people or or
Yeah. or like you know manipulate people in some way that's dangerous and a lot of our
guard rails around these things
are very brittle and we we currently don't have a way to do better because we don't really
understand these systems
and so I want to really use our understanding in a way to shape actually making these
models more reliable in all
of these contexts. So talk a little bit about with that context in mind how you've kind of
Gap between benchmark performance and real-world user
experience
crafted a research agenda. What are your core focus areas? Yeah. So, I've always
been interested in thinking about uh like this is maybe a catch-all phrase of distribution
shifts, but it does capture
this idea that, you know, we measure performance on a benchmark. And if that's all we
care about, it seems like
we can do really well because if you collect data that morally looks like the data you want
to do well on, you can
just, you know, throw a lot of compute at it and it seems like that just works really well.
But at the same time, like
how does that does that tell us anything about like how the model works in any situation
that's slightly diﬀerent? But
you still expect the model to work well. So that's sort of the angle that we've taken in a
variety of diﬀerent
questions that we ask is like we can me minimize some loss or like try to target a certain
benchmark which is what a lotof these models are trying to do. But like does that actually solve the task if we you know
just test it in a slightly diﬀerent way that is also
meaningful from a you know from a deployment perspective but like does like when does
that break the models and why does that happen and how does the
you know the training dynamics or the data curation like what aspects of these actually
influence this behavior and
what's the right way to intervene and make these problems you know go away this
growing gap between benchmark
performance and the experience of using these models I think is
kind of a growing concern and one that we're hearing a lot of you know at this particular
moment of time I think
because of the recent release of GPT which like according to the benchmarks
is the smartest model around but the user experience for many has been lacking in a lot
of ways and I think
that kind of exemplifies this this idea of the you know benchmarking as we think of it
today being uh somewhat inadequate. Yes. And maybe one concrete way of thinking
about this that I feel like is
Fine-tuning and model adaptability
very very important uh but people haven't thought too much about is um many times we
want to use this as a
starting point and do some kind of fine-tuning and so this could just be for safety
alignment that kind of stuﬀ
that we can say oh maybe one company just takes care of that but also a lot of
companies have their own propriety
data that they want to fine-tune on or like you want to personalize it in some way to your
context or you want it to
improve over time and you know things like that or the world is changing So we don't
have a good way of measuring you
know this adaptability of these models which I also think is actually a very fundamental
question and as an example I
was starting with a colleague uh Graham Nubig um who kind of asked me this question
several months ago on like umwhich model should we start oﬀ if we if we had some you know data that we wanted to
fine-tune on should we take the model
that like as such on our benchmark or like on this data works really well like the zero short
performance of the model
as is does that automatically mean it's better after fine-tuning and yes and we
realized the answer is like really no and one for a lot of things actually model performance
on a benchmarks kind
of tracks performance including reliability actually or robustness to a lot of distribution
shifts what we found
like you know what the community has found is in general the more data you train on like
all of these numbers go up
but this one aspect of how easy is it to adapt these models after you train them
on data we actually found the reverse thing happens at some point. So if you take a small
model and keep training on
it on a lot of data, we see that eventually the model that has been trained on more data
that you've thrown
more compute on is worse as a starting point for fine-tuning than an earlier checkpoint
that you had. So this was
actually really striking result because it's one of the first realistic cases where more
compute in a very
non-contrived setting like on high quality data more compute is actually kind of making a
model worse. It's not
just that it saturates but it's actively worse. And another context in which this happens is
um you know when we people
are trying to serve quantized models to improve uh eﬃciency there also we find this kind
of trend where at some point
like we should as you throw more data at these models and then you quantize them the
model trained with more data still
is better but then you see this U curve where at some point showing more data actually
means that this model is worse
after quantizing which is again a case where your downstream model is strictly worse
even though you've spent morecompute with the best of intentions and shown good data. So I think this was like a really
interesting kind of
finding that I think people should think more about is like one important aspect of using
these models is actually fine-tuning and adapting and our current
you know push towards just doing what we're doing now by improving this pre-training or
like the first step of
this process by really optimizing that doesn't mean it's going to be good after doing your
fine-tuning or post-
trainining and this is not just a theoretical limit we actually see that you know a lot of
people talk about how
llama uh so this is before the llama release. So people were just talking about llama
versus llama and a lot
of people found that llama was much harder to fine-tune you know in like academics
regularly fine-tune models and
so you know this was sort of Graham's question too and it kind of ties into this idea that
it's because we have trained on so much data that at some
point llama trees is still really good at benchmarks but it's just worse if you want to kind of
use it for your task and
similarly we ran experiments on the mo checkpoints because you know great work
they're releasing all these checkpoints so we can do analysis on them and we
found that the model like the smallest size model B I believe that was trained on three
trillion tokens is actually
worse than the model that was trained on you know lesser tokens uh fewer tokens after
we do this kind of fine-tuning or
post- trainining on you know very realistic benchmarks that people care about. So this
was kind of an exciting
result that shows that you know we might need to sort of one axis of rethinking pre-
training is like how do we get a
good starting point for fine-tuning. Is it specifically the ratio between the
Token to parameter ratio
number of tokens that the model is trained on and the number of parameters that uh you
found to be in inversely
proportional to performance and tuning? Yes. So for the precision result that's exactly
what we found and u you know wetried to give diﬀerent exponents but it turns out that in our experiments the exponents
turned out to be the same. So it's literally the ratio but in our
finetuning we kind of didn't do precise like curves because a lot of them depends on the
exact distribution of
interest. So there's no like a clean mathematical result that would or the trend won't be
the same for all data
sets but in general we find that um it does like a larger model can take in
more tokens before it shows the sort of like inverse eﬀect compared to a small model. So
in some sense more to like a
larger model can absorb more tokens eﬃciently but it's not always exactly the ratio. It
could be a diﬀerent
exponent. In some ways that strikes me as like an intuitive result in the sense that you
know when that ratio is larger the model is potentially more overfit and it would be harder
to unlearn and learn things as
you're trying to fine-tune. I feel like another way to think about this is usually when a
model when we
train models and you know some of I've looked at learning dynamics and things like that
for a while now and the
converging result in that space is models learn simple things first and then they learn
increasingly complex
things and so like my colleague had this kind of visual image of like trying to like you
know build something with cards
like usually you start oﬀ with something really solid and then you kind of add more and
more complicated things but then like that also means that
that's that's that structure gets less stable and so if you actually try to like adapt these
models in some way then
like everything collapses in some sense and so I think we see something similar that like
the like the you're forcing
the model to learn more and more complex things which is good because it's fitting the
data but then that also means the model is brittle in some way
that like you try to push the model to be a little you know in some direction by minimizing
some gradient steps in adirection but that introduces so much noise or like kind of breaks the model and causes a
lot of forgetting. So
that's sort of what and it's same thing for precision too like you know we add you can
think of that as like adding some kind of noise by changing the
weights and so the models become like less um like what like they cannot absorb that
noise and they just break.
It strikes me that looking at this ratio is a fairly coarse grain metric, but that it would be
interesting to go even
further like if you could for example understand the relative distribution of
the training data on the model relative to the direction you want to fine-tune it to. Like you
might have a model that
is, you know, benchmark benchmarks worse, you know, is smaller or other
reasons why you might think it wouldn't do as well, but because of some like distribution
overlap or something might
do better. Is that a reasonable direction you think? Yeah. So there are diﬀerent ways to
think about this. So like one is purely
kind of is the model more stable in that it can like move in more can move in diﬀerent
directions without like losing
too much, right? Right. And so that's this token to parameter kind of you know could like
roughly correspond to that.
And then the other questions like what you said is like how much do we actually need to
move and we have some experiments in our you know this
catastrophic overtraining ICML paper where one proxy for how much to move is
just the learning rate um you know so if if the model gets good performance even with a
small learning rate then that
roughly means the model hasn't moved too much and um you know it kind of works like
the the distribution is closer in
some sense. So that is that we do find some interesting trends over there as well. So like
if we start measuring or
fine-tuning on things that are very close then uh we actually don't see this eﬀect like the
models are able to take
in more tokens and still show good performance because we don't really end up the
model much and in the limit ifthe fine-tuning matches a pre-training then you know like we just get back the usual like
things go down as we show
more data but then as we have larger changes then you know surprise like these kind of
trends start happening
where like at some point the model it's actually getting worse and one challenge is that
it's not It's not very easy to
say which distributions are close or hard because we might have some intuition for what
this is but like how
the model stores information might be diﬀerent which is sort of why we look at learning
rate itself as like a proxy
for how much the model changes as a way of saying like how diﬀerent the distributions
are. And then when I hear
Overtrained Language Models Are Harder to Fine-Tune
paper
catastrophic overtraining, I think of not just that there's like this inverse
uh this inverse relationship, but also that there's maybe like a cliﬀ like you reach a point
and then your fine-tune
ability kind of falls oﬀ a cliﬀ and it's it's much worse. And did you kind of characterize
what that point is?
Yeah. So I guess like the way we so what actually happens is like at some point I mean
like overall in the there is a
regime where showing more data does help like no matter what the model size because
the model is just learning stuﬀ
and then at some point the model gets so brittle that whatever it learns from the more
data kind of just like is overcome
by its brittleleness and so like we start seeing this jump so there is a point where more
data starts hurting you
so it's like a U-shaped kind of situation and so and the point at which this U is really
depends on um kind of
like we discussed like it depends on the data that you're fine-tuning on. Um and
yes, so I yeah so we are able to characterize these precisely in thequantization setting because there's just fewer factors to account for because you just
add noise. But in this fine-tuning setting is a little bit more
tricky because we can't exactly say what the distribution of interest is. But if we fix a
certain distribution or a
certain learning rate that we care about then again this point actually becomes
predictable. So we didn't go into
modeling this functional form too carefully in the fine-tuning setting in our paper and I
think that would be very interesting future work for once we
decide you know what kind of distributions you want to fine-tune on and you want to
make decisions on how to allocate compute and do the scaling laws
and so on but we do exceed trends where it feels fairly it looks fairly predictable with a
nice mathematical
Base model selection
form so having done this research and uh you know identified these results if you
were to you know approach a a future task and need to fine-tune a model, how
would it change the way you think about base model selection? You know, beyond the
generalities, like would you it's
it's good to know because it helps you understand, but you would still like test everything
and see how it performs on your data or is there just a whole
set of models that you would no longer look at uh for example? Yeah, that's a great
question. And I
think if you are using a really I guess what we found is the billion model size which again
some you know might you
might want to use for eﬃciency reasons. So if it's trained beyond . trillion tokens or
maybe even two
trillion tokens because we didn't have too much granularity in the public checkpoints I
would say like okay maybe
that's a point where you you don't want to use that model unless you're sure that you
don't want to change the model too much. Um and in terms of like the so
that's sort of like one thing that's clear in in all the gray areas in between I think it we do
have to do some
preliminary experiments where we take you know a bunch of diﬀerent checkpoints and
see like what the fine-tuning performance actually ends uplooking like and that would you know give us some sense of like are we which part of the
U curve are we on and so can
we actually so I would say like that's the understanding it gives us is that we kind of
expect this this shape and we
can try to probe to see like which regime current models are and so that would guide us
like where the optimal
could be. And this is the paper overtrained language models are harder to fine-tune.
Uh we'll link to all the papers that we discuss in the show notes for folks. Uh,
and so you're just kind of contextualizing this and we'll get to creativity in a second,
Unlearning
but you published a really interesting blog post that kind of surveyed all of your labs uh,
papers at ICML and it was
kind of broken up into limitations and opportunities and one of those limitations is
overtraining and that's
kind of what we just talked about. Uh the next one was unlearning and the challenges
associated with unlearning
which is related to this idea of fine-tuning. Talk a little bit more about what you've seen
with unlearning.
Yes, that's like yeah, it's actually very related and so like when you think
about what is the use cases of fine-tuning like one is you know just to specialize and like
push a few benchmark
push a few numbers on your use case rather than the benchmark but actually another
important use case for all of
these like post- training or fine-tuning methodologies is safety in some way. And so of the
alignment work is actually
trying to teach the model post hawk what is good and what's bad. And similarly we might
try to unlearn harmful knowledge
or unlearn private information and so on. So that's like a very safety specific use case of
fine-tuning. And we
tried to look at why is it so hard to do unlearn English. There are like so many papers that
are published and it very
much reminded me of adversarial examples from my PhD where people had all these
defenses ideas for defenses but then youknow Carlini would break all of them. uh and so um and so kind of yeah so that so
yeah so it was basically it kind of felt like that and if you look at some of the assumptions
or kind of how the unarning
field has progressed it's it people have tried to take the base model as it is like or like take
the starting point as
it is and then try to assume certain things that might be happening in these models and
use that to get algorithms
and to maybe maybe uh interject and to be more concrete about unlearning you
mentioned safety but you know example might be you may have in the training data how
to create a chemical weapon and
there's a whole you know line of work around like building guardrails to like
detect that and suppress the model from talking about that but another direction is to try
to just extract that
information erase it from the model and that's unlearning. Yeah. And it's not it could be
harmful
information. It could also be private information that like the you know they didn't
shouldn't have trained on or
someone wants to remove that information. And so it's something that exists in the model
and you kind of want to remove that. And so I guess maybe the
privacy angle also tells sort of why the guardrails feel sort of you know you kind of really
just want to remove it
from the model and want it to be like it wasn't ever trained on this data. So you know
that's uh the other use case for
all of these things. And so what people have been trying to do is so you can start the first
like the first attack
would be or like you know first way to try to address this would be to fine-tune so that the
model has high
loss on all of these things that you want to forget and then people realize that that you
can't actually do too well
because then you kind of you have to like really change everything a lot and that destroys
a lot of information inthe model. And then there's another sense that maybe that this information could be
localized or maybe we can find
specific neurons or specific subspaces and try to just erase those parts. And even that
has actually limited success
for two reasons. One is we have to first find a way to figure out where those neurons are
which store this
information. And second is even I mean and even after we find that it's not clear like
what's the right way to erase
that without you know destroying everything else. But the assumption here is that there
exists such neurons in the
first place. Like and what we show is that that actually is not true. Like there's no reason
in how we've trained
these models that encourages or that should allow this information to be disentangled in
this nice way. And it
seems dis it seems like maybe we see such separation. But because the separation is not
very good, that's sort
of why our unlearning methods don't work very well. And so we instead say like instead
of constraining ourselves to
work with this starting point that is not very good in that it's not really disentangle all of
these things what if
we give ourselves a flexibility of like what what if we could train our models in a way that
enables this kind of
downstream unlearning because we know that that is a use case which we might care
about. So that inspired this work
Memorization Sinks Isolating Memorization during LLM
Training paper
on um memorization syncs which is kind of taking the same idea or assumption that
people implicitly tried to make
about models that maybe information is isolated to neurons but instead of waiting for it to
happen by magic we
like let's try to actually enforce that by design and we find in our paper both through
experiments and analysis that
normal training does not actually lead to this assumption to be true because umlike yeah we have analysis in the paper but kind of the main idea is like We don't really
encourage or force this
sort of disentanglement and it really depends on the bias of the training algorithm and the
the current training
algorithms don't have a bias to actually enable this kind of separation but we can
encourage the separation.
So the assumption that we're talking about is that knowledge is localized essentially.
Exactly. Yes. Yes. That knowledge is localized. Yes. Um so there's no like if you look at the
training objective
you're just passing gradients to all the parameters. So there's nothing about and it there
is some you know separation
that seems to emerge but it's not perfect because it doesn't have to be it's not trained to
be. But what if we
instead trained to encourage this sort of separation? And that's exactly the idea behind
memorization syncs where
we're trying to say for every document, let's say that these are some specific neurons that
are only updated on that
document with the hope that all the information that is specific to this document like goes
to that neuron and
those neurons are not touched or updated on other documents. And so that's the main
idea here. And we of course want to
have shared neurons because we also want the models to actually learn from all of this
information and we don't want to train completely decentralized models
because those won't be as capable. So we're trying when you're doing pre-training we
want to model to learn something that is shared and this is
where again the beauty of the training or the inductive bias comes in which is with this
architecture the model
actually is incentivized to keep the shared information that is shared across all the
neurons uh sorry across all the
documents in the neurons that are updated on all the documents. That's just a strictly
better solution. And the
stuﬀ that's very specific to a particular document is in those these memorization neurons.
And since thoseare not updated on any other documents that information is sort of preserved,
disentangled, kept aside. And we find
through our experiments on uh in a somewhat small scale but we're scaling that up now
is that this architecture
actually enables this kind of nice separation between um what is special or
like what is unique to your particular documents that's all kept in a specific neurons
whereas what is shared is
allowed to be learned in the spe shared neurons and at test time you can just drop out
these memorization neurons and
then you're good to go. A couple questions. So you so are you
at train time are you identifying the information that you will later want to
pull out of the model? Yeah, that's a good question. So the way we're setting it up right
now is that we
are just having um the units that we might want to remove. So if you feel like this is this is
this document is
has information about a unit who might want to remove this information, then we kind of
associate this entire document
to a specific set of neurons. So it could also be like a topic like let's say we say that we
don't want to be at
the document level but we want to be at the topic level then you want to have neurons for
all the documents for a
particular topic we want to selectively kind of uh activate only those neurons. So we
should we need to know kind of
that abstraction that we might want to remove later. It seems like the number of these
memorization sync neurons would be a hyperparameter and like the ratio of those to the
total number of parameters
is kind of an interesting Yes. Did you to what degree did you experiment with all of that?
Yeah, we we experimented with all of this. So, we do need to like so the models have to
be a little bit bigger in this way because we do want more
neurons. But one other kind of nice trick is we don't need them to have completely
separate neurons. We justneed to make sure that the neurons are somewhat orthogonal. And so we can just pick
random highdimensional directions
and they are almost orthogonal. So that kind of means we can have a like so we can
instead of operating on individual
neurons we take these neurons but activate diﬀerent subspaces that are fairly orthogonal
and that also works as
well. So that's a trick to prevent the to prevent having a really large model size if you were
to otherwise have a
specific neuron for like every document or something like that. So that's one way in which
we're able to like make
sure that the model size you know doesn't go up way more than what it is. So we have
ablations a paper where we
find that for moderate increases in model size uh we're actually able to kind of encourage
this behavior.
Are these neurons like localized in the architecture like to a particular layer or are they
distributed? Are they is
kind of the topology uh totally learned or is it uh is a
priori like set up where the these neurons are? Yeah. So um what we do in our paper is
we pick a random for every um document we have a hash or like some kind of
random neurons that that particular combination of neurons is activated and so this
eﬀectively models like kind of
some one dimension in like one direction in a high dimensional space that's like like left to
this new document. Uh one
could consider smarter or like there might be improvements to this on like kind of which
layers should we look at.
So we we only looked at the MLP layers and um we only introduced these things within
the MLP layers sort of building
on the intuition people had that facts or factual information is generally stored in the MLP
layers. Uh but like I
could imagine like there's a lot of research that one could do to like you know be more
intelligent about this. But we kind of learn this and and right now
it's just random. We could also try to uh kind of have an um say like relateddocuments to maybe share similar subspaces in some way or something. So we could
even have like a softer version
of this where instead of everything being orthogonal, we can maybe put like things that
are slightly close together to be closer together or so on that
might further push up performance. I think there's a lot like a lot of things that one could
do here and I'm very excited about this because I think it
really kind of tells us ways to in which we can get more control over these models by
design.
It also makes me think about kind of the overlap with the anthropic circuit
tracing work and if there is some way to combine these techniques to better localize
concepts.
Yeah, that's a great point. So one thing that could be interesting is so maybe natural
training already has a
propensity to have certain kind of structures but like it's not perfect. So maybe we can
start with like okay these
are structures that seem easy to enforce. So let's try to like actually hard enforce them
and so maybe that's a
way to like take these fuzzy kind of interpretability stuﬀ and like actually train a model to
make those more hard
and more concrete to enable better control. Yeah. And to a first order we kind of do
something like that which is
people have kind of thought that knowledge is isolated and so we were like okay let's try
to really isolate that because it seems plausible. So we
could imagine doing other things like that. uh that paper is called memorization syncs
isolating memorization during LLM training. It
Role of memory in LLMs
also brings to mind for me uh you know maybe it's just this word overlap of memorization
but a lot of conversation
now is talking about the role of memory with LLMs and you know in particular how
you know memory is not a very robust feature of like attentionbased
LLMs and how memory architectures are are a promising way to increase
performance like does that relate to this in any way? I mean I can think of a philosophical
way in which I thinkthey're somewhat related uh in that I think in some sense we want to like have
like another way that memorization things actually could be useful is not just in like this
me just for like
privacy but it tells us like we can disentangle things that should be constant or kept in the
model and things
that should be updated. So for example, facts change, but we want to still preserve the
ability to reason or the
linguistic capabilities of the model. And so if we had ways to kind of disentangle those,
then that helps with
some of these things. And so you can think of memory in the context that you were
saying as stuﬀ that we kind of want the model to actually remember. And
so the more we can kind of disentangle stuﬀ that should be kept around versus stuﬀ
that's independent of that, I
think in that sense they are sort of, you know, related. Um and maybe there are some
ideas that we can cross share
on like how the exact architectures are developed and so on. Yeah. Yeah. Yeah. I I don't
know what the kind of neuroscience
implications would be or what we've learned from neuroscience, but it strikes me that like
in humans like fact
memory and con concept memory are diﬀerent and so we should have diﬀerent uh Yes.
things on the the AI side. Exactly. And I think architectures that are scalable but still kind
of try to
enforce something like this I think are very promising. And so lastly on the list of
limitations you profiled is creativity. Uh and
Going beyond the creative limits of next-token prediction
paper
that's where your big paper comes in. You know talk a little bit about the motivation to
explore creativity.
So I guess like every like every AI researcher I try to also use LLM as much
as I can to automate and make my life easy. And you know sometimes uh like may
or may not have happened in real is that you prompt the model to generate homework
problems right like especiallybecause you want the model to generate something new or like you know I'm like oh like
can the model come up with
something really clever like a way like to test students that I couldn't come up with or
something. Um or new research
ideas to you know write some new grant proposals or something. And I've almost always
found that or maybe always like
the models have never been able to give me something that's truly like aha I hadn't
thought of that. So they're great
at almost every other task that I try to use them for. Like they're great at summarization.
They're great at like you
know looking at what's common across bunch of diﬀerent things and drawing some stuﬀ
there. But they're not really
good at these open-ended tasks that I give these models. And so that was sort
of like the kind of motivation or like just you know there's always something that was
lingering as like yeah I just
don't feel like or like how do we think about that and there's also work that people have
been trying to do uh you
know in the community about analyzing research ideas like actually running human
studies to see can models generate
ideas or not and there's been a lot of back and forth so it's something that like is very
fuzzy and like seems like
things people are thinking about and uh this was in collaboration with Vishnav who's a
researcher at Google and so we
having this conversation and he was also an author on this next limitations of next token
prediction paper and so I
wanted to do some kind of a similar research of like like let's try to identif like what are the
core
principles that we might need for creativity and can we test like can that actually emerge
from these training like
training objectives that we have from these models and that's like a way that we can get
an answer to this because
having actual benchmarks and testing creativity and who knows what's in the training
data all of that makes it harder to answer this at scale So we tryto take a diﬀerent approach be like okay let's just like start from first principles here and
think about creativity try to devise simple tasks
and see in these concrete tasks like what is the right objective like how what what does
next token prediction do
how do we extract creative solutions so that was sort of how that gotten that how we
started thinking about this at
the same time I also had another project in my lab that looks at this from you know more
uh slightly more realistic
settings of uh problem solving like reasoning and there again We found that models
especially after you train them
more they started kind of collapsing in their solutions. So um for people who are familiar
with inference time
settings like you can either give the model one shot to answer or you can query it multiple
times. And what we
find is that when we try to train models in general their performance at this oneot setting
does go up but they also
get worse at this like give it multiple times. So what it kind of means is that when models
are trained too much, it
seems like they start giving the same solution and try the same incorrect thing rather than
actually trying diverse solutions. So I was kind of
convinced that like this is actually a problem and that models are not very good at being
kind of trying out
creative diverse solutions even on realistic tasks and we kind of wanted to study this from
a first principle. So
that's sort of really what you know motivated us to think about creativity. And then once
we had some really simple
tasks to work with that actually allowed us to make formal statements or or like even
intuitive statements about what do
diﬀerent objectives do like how do they perform like can we do something better and we
found some really nice
interesting alternatives to the current paradigms that people have to improve creativity.
And we are now trying to runthese at scale and put some of these ideas um you know and actually training larger scale
models. And we're kind of
excited to see where we can take in terms of making models more creative by changing
the way we train them.
Creativity
So, so talk a little bit about what an objective for creativity means like that
seems uh very diﬃcult to capture in an objective. Yeah. So, we um drew inspiration from a
lot of like work in cognitive science like particularly Bowden's work that tries to formalize
some notions of
creativity. So we are in no ways kind of uh we're like really not thinking about like what's
the right definition of
creativity but more like let's lean in on the definitions that cognitive scientists have taken
about creativity
and like use that. So it's a very concrete example there's this notion called a
combinational creativity
and I think a nice example of that is like word play. So, if we think of a joke, for example,
um let me what this
uh why did the scare what's let me try to pull up what exactly I'm missing a punch line
here. Uh yeah, I I feel like
I've seen this so many times that I I'm like it's not funny to me. So, yes. Well, yeah. So, I
guess the the one
example is why did the scarecrow win an award? And the punch line is because he
was outstanding in his field. So if you think about why this is creative or why this is funny
is because scarecrow and
award are two kind of seemingly diﬀerent words like unrelated but there is this actual
connection like
outstanding that is somewhat novel or something that you hadn't thought about that like
actually links these two words together. So that's an example of next
token uh sorry that's an example of this combinational creativity where we have
like we're trying to see whether the model can find unexpected connections like through a
graph or like find two
words that like have a common parent like this out two diﬀerent interpretations of
outstanding and solike can the model actually give new sort of ways of doing this and so the way we
abstract this is now let's say we
have a graph and we teach the model all the edges in the graph can the model actually
discover
uh new siblings. So like two nodes that actually have a parent. So the two nodes don't
look connected but they have a
parent. So can the model actually see some of these and then generate more of these?
Like can it find new connections
in the graph? So that's one example of creativity that's abstracted really following you
know Bowden's work on
combinational creativity and they have a lot of examples on like you know how a lot of
things that we do that we think are creative are actually kind of
finding these connections unexpected connections between things. The other kind of
creativity we consider is just
Exploratory
exploratory which is we just want to free form find interesting things in the world but you
know of course they still
have some structure to them which is but it's just sort of a latent structure but we just
want to find new things from
with that structure and like Bodin explains a lot of the work that artists do for example is
this kind of
exploratory creativity and we try to write this down in like math and symbols that we can
train models on as let's say
we train on a bunch of like can the model like generate circles for example
same in the following the graph uh kind of setting can the model find new circles or new
triangles in the graph
that the model has wasn't trained on so these are the ways we think about creativity like
they're not perfect by
any means but I think they capture like some of these core principles and they already
show why certain training
objectives might actually be good or bad for these notions of creativity and how do we
kind of and we can you know digmore into that like what's the right way to train these models or what could current
training be missing and how
should we be thinking about you know maybe new ways to pre-train these models to
encourage this kind of creativity.
Taking a step back and maybe getting a little bit philosophical, how do you distinguish the
kind of creativity that
Diﬀerence of creativity in LLMs
you are thinking about broadly meaning not necessarily you know these particular
constructs but you know more
broadly the direction that you'd like to see LMS go with you know I asked the LLM
to you know tell me a joke with a funny accent and like it can do these kind of
creativityish kinds of things like how do Do you for someone who says, "Oh, I use jet GBT
all
the time and it's very creative like how do you distinguish?" Yeah, I think I feel like one
notion of
creativity is just is it generating something that's not in the training data, right? And this
was and something
meaningful and like this was already for a long time like not easy and so it's like you it's
very impressive that
models can do this and can generate poems in the style of blah blah blah, right? Like we
can do all of this stuﬀ.
I think the diﬀerence becomes what I feel is like open-ended versus like closedended. So
in these cases, we're
still kind of saying like roughly where we want to go. Like if I say write X in the style of Y, I
kind of I'm telling
the model what to do and then the model can fill out the path. But what I'm thinking
about like creativity is like take me to things that I've just never
seen or thought of before. And I think that's the part where I feel like um like all our
constructs as well are
trying to say and even from our own use of these models like I feel like that's maybe
where we want to think more. Um I
yeah so I think for as another example like when I look into like these benchmarks or
people trying to usemodels to for example kernel bench to come up with like solve index problems in new
ways like it feels like we still
have to carefully kind of prompt the model on the strategies or the things it has already
done and things it should
explore and so on. So I think that part is still coming from our like from our explicit
instruction even though it's
generating new things. And so I kind of want to see like can they actually do this part on
their own too? And I think that's what it would mean to
meaningfully kind of go beyond um like what we are able to do and find new things. And if
we are able to do that
and we're able to do that at scale then like we're actually going to really discover a lot of
interesting new things and find new connections.
And then how about the idea that hey I've already got a creativity dial its temperature and
I can crank it all the
way up and wow it's doing things that I totally didn't expect or you know didn't prompt it
to do.
Yeah. Before we jump into that, I want to uh also say like uh when I was trying to prompt
these models for this iClar,
we were work ICML we were working on the talk and we tried to just get can the model
generate jokes uh that I can use
like the scarecrow kind of thing like new jokes and it was actually really bad and I think we
were joking that it's
because models were trained with you know this kind of objectives that we are just
showing in our paper are not very
good and so that was actually a case where I was trying to like get a model to like say
something that was new that
was a new joke and like but still have the structure and it wasn't able to but maybe I mean
and to the best extent that
I could prompt engineer it meaning that uh you know maybe if you're
thinking about it casually like and just asking the model to tell you a joke maybe you you
know it'll come across
some that you haven't heard before because there are a lot of jokes out there but like you
know if you reallydig into it you know they're probably not novel and you know they're probably
not funny. Yeah. and and we couldn't get one that obeys this structure of like connecting
like for example the prompt would be like tell me a joke that's funny because it connects
to unexpected entities right
and like that was the kind of word play that we were trying to get at like so it's finding a
new connection that like I hadn't thought about but like it was
kind of bad at doing that so you could think of many diﬀerent structure of jokes but like
this particular aspect of
like kind of this hidden punch line that the model discovered uh it didn't and I think there's
a very deep reason like
who we explained in the paper is that a lot of the training kind of like the training data that
doesn't really have supervision on sort of this like it doesn't say first the punch line and
then the joke that the
model can do that but instead the punch line is sort of latent and so that actually means
that the models are not
able to kind of learn the right structure and they end up learning some things local that
are like sort of memorization and they don't learn this
true process that we want where think of something that's search over all possible things
and find something new and then generate them and so that's
sort of the limitation that we try to show In the training of these models, two things jump
out at me. One is that
I'm not sure that a human would do very well with that kind of instruction like generate
this joke on the fly given, you
know, this criteria of funny. Uh but also that
you know there's something maybe orthogonal to the idea of you know structure and
creativity or structure
and like impulse and like trying to convey both of those maybe is confusing
to the LLM like rules and like create. Yes, actually that's a good point. So like a lot of the
creativity is not just
simply saying something crazy but we wanted to be still structured and meaningful. And if
you think about like use cases like molecular biology or likeyou know drug discovery, it's not like we want to generate like random new things. We
actually want the model to infer sort of the right latent structure
and all of these and generate new things according to that structure. So that's really the
kind of kind of creativity
that I'm you know thinking about and like you know yeah that we try to model in these
tasks and that's a great point
that like how do we um get a model to try new things while still obeying some
structure. Um, and I think you were just asking me a question about like the temperature
and I think that really
leads into that where like you know just crank up the temperature you can start getting
crazy things but then the model
is also going to be less structured. So we really want this sort of structured exploration
um from these models and
similarly when I try to get a model to generate a homework problem I don't want it to put
together something like that's like meaningless so that's you know
creative but like really I wanted to follow some certain logic or some structure there. It's
an interesting
idea that the most valuable examples of creativity are, you know, a
balance of structure and impulse. Absolutely. Yes. Yes. Yes.
Look before you leap part in the paper
That paper is roll the dice and look before you leap going beyond the creative limits of
next opening prediction. Where does the roll the dice
and look before you leap parts uh come into that? Okay. So, first I talk about the leap
because I think that ties in
closer to what we just chatted about which is uh sort of like this word play or like this
connection we they're
looking at task where there is a leap of thought that has to be made which is not often
spelt out in the training data
which is why models struggle to actually infer that thought. And so what we're saying is
that models should actually be
trained to kind of learn how to take those leaps or like take those structured leaps
especially and ratherthan just showing the outcome of the leaps which is kind of what current training data is
because those just have
they don't have the thought process that goes behind these which sounds a little bit like
training on thought traces as opposed to training
on answers like do you think there's a path there? Yes, I think that that's certainly one
way to do that or uh but I
think another part that we show in the paper is actually diﬀerent training objectives like
teacherless training or
so that could be like things like multi-token prediction where we are trying to discourage
the model from getting the right answer by just looking
locally but like if it doesn't if it has to actually generate the entire pattern or the entire set
of things uh then that
actually encourages the model to have this global understanding and people are excited
about diﬀusion models lately.
We find that diﬀusion models also kind of have a similar thing where they don't show all
the tokens and they kind of mask out diﬀerent things and so that
actually encourages the model to have some sort of planning or like some you know uh
the ability to like do more
global things and so we find these two objectives actually work a lot better in our
experiments. Um one is multi-token
prediction where we just force a model to produce multiple tokens at a time rather than
just one token see the
correct answer and then the next token. Um and so in multi-token we kind of the model
does not get that local
supervision has to get everything right before it gets reward. Um and diﬀusion
models um of you know like can be more thought of as like having these diﬀerent masks
or diﬀerent orderings
and so that also encourages the model to have like more global understanding. So both
of those are alternatives that might be worth pursuing more seriously
if we care about getting these kind of diverse generations from the models. So that's the
part about like look before
you leap. uh the part of a roll the dice is also really interesting. I think one
Roll the dice partwe like there's an underexplored aspect of like how to get diverse things from the model.
Uh right now there are two
ways like one is we think about the diverse stuﬀ ourselves and like you know when
people prompt the models
they're like we give more specific instructions and then we're like actually I want to do
something else and then we tell the model go do this
instead. So that's one way. The other way that you know machine learning people may be
thinking about is like
just increase the temperature and that like gives you more gen you know tokens and like I
said earlier that also tends
to really destroy the structure and so we try to think about like okay how do we uh think
about creativity like what's
the right way to kind of elicit this randomness from the model that can be structured and
one way that seemed more
natural than temperature sampling is first generate like a random idea for
like you and then follow that idea and generate all your tokens. So the right place to
introduce randomness is
probably at the beginning where the model commits to exploring something and then
once it decides to go down that
path that's like if you keep increasing the temperature then it's just going to go all over
the place. Instead we pick something and then we stick to it. And
so at test time if you want more diverse generations we would sample new prefixes
or new starting points and then let the model kind of do its thing. So that's where we're
trying to say we should
introduce randomness which is like the roll the dice. So we roll the dice first and then
once we are you know based on
the outcome of the die we kind of pick that thought and go and go with it. Um and so this
of course requires training
the model to be able to do that and we have a very simple way to do this in the paper
which is we just in the training
data we just have random prefixes that we prepend. So the model conditions on a
random prefix and you can think of that as like some proxy for a random idea and then it
generates things. uh and at testtime we can get new ideas or new generations from the model by changing this prefix
sorry
random nonsensical prefix or a random sensical prefix or yes great question so in our
paper
because our experiments are so simple a random nonsensical prefix actually just works
which is surprising we don't
really understand why it works that's very interesting future work too but as a proof of
concept it seems like okay
like there's maybe some meat here and what we are looking at now in my group is having
more meaningful prefixes which
actually capture like what exactly is the idea like some semantics of the idea that could
and then condition on that to
generate things and if you know some this paradigm of pre-training ends up working this
will also give us more
controlled diverse generations. um instead of prompting the model with explicit
instructions, we can actually
just change this prefix that we condition on in some nice way and then we can get you
know diﬀerent like we
can get diversity in that sense as well. And so that's what we are trying to say that maybe
we should think about is uh
rather than doing temperature sampling maybe we can tell the model to condition on new
ideas uh random that can then be
randomized or can be made more diverse and that way of training as well as inference
might actually be a better way
to get structured diversity from these models. And we we mentioned GPG and
also this idea of you know inference times compute inference time scaling and
one of the things that I think we're learning about this model is that at least at the higher
tiers like it does a
bunch of parallel inferences and kind of integrates those together and
uh in some sense you might think that okaying this stuﬀ in parallel like you're going to get
this diversity of
thought, but also there seems to be this averaging eﬀect that kind of like uhdries out the expression of that thought. And it uh strikes me that it's
connected to kind of your work and maybe they need more random seeds in their their
parallel uh threads or something.
Yeah, it also depends on how these like parallel thoughts are actually coming. I mean, we
don't like I guess uh I don't know how exactly those thoughts are
being generated, you know, behind the scenes there. Um so, two comments. So one is
like if they're doing RL on sort
of a starting point. Um the question is like can we how do we leverage the starting point
appropriately to get the
right diversity like can you actually go beyond what the base model can generate like are
some things more likely than
the others in which case like can we correct that in some way like what if we want to
generate more of one kind than
the other. So all of these kind of things are still going to be quite challenging with like kind
of the
current paradigm. So hopefully if we do pre-training in a way that allows this kind of you
know diverse control
sampling then there's more that we can get. Um but yeah I think the the thing that like is
like basically unclear is
like what like how do we get that diversity and like how do we actually span things like if
we just let it all
be end to end from the model then again there might be some collapse and like the
model might not be generating all
the diverse things that we need. Um and yeah and there's some of that that you can
simulate by carefully collecting
trading data. But then of course like if you want to do stuﬀ that's like very diﬀerent from
your trading data like how do all of these things work like
yeah that's hard to say again with the parallel traces kind of thing. But I think model it is
sort of what we're
saying is that we want the model to um you know try it a new idea and then stick to it
rather than like you know
introducing randomness at every step. And the random prefixes,the random prefixes in your case are at uh inference time. So it's like you're
prepending that you're prepending this random prefix uh to the prompt.
Yeah. So in our uh in our toy settings, there's no like notion of a prompt. I guess there's
no instruction, but yeah,
you can think of that as like prepend. Yeah. Um yeah, you're prepending. So you're giving
a question and then you're
adding the prompt and then letting uh sorry, adding the random string and then letting the
model generate. That's how it would work in practice.
Yes. But you also have to train a model to be able to do this. So at training time too, it
should we have to simulate
this where the model has like random strings in the beginning that it uses in its you know
while training.
Uh meaning so don't expect that you can just add some randomness to the beginning of
a prompt to chat GPT. That's going to give you better answers.
Yes. Yes. Yes. Yes. And so you kind of talked about uh RL
Compatibility with RL training
is the do you think that the approach is compatible with uh RL training?
Yeah, this is fascinating. I think overall any improvements that we can do to the base
model in like terms of like
how we sample that directly translates to RL because a lot of the RL is like you try a
bunch of things from the model
and like you up like you know you make the model do more of what it's doing well and so
if you just have better starting points like then then you just
like will automatically improve all of these things and the way I think a lot of this could be
worked useful is in
ideas like structured exploration and so on and you know people keep bringing up I guess
like exploration is kind of one
of the biggest challenges is to um you know to like the next frontier. And so if we want to
uh do some kind of
structured exploration over many diﬀerent spaces like the more control you have over the
kind of diversity like
the better you know like yeah so all of that I feel like that that's very compatible and
would like actually be really useful for further adulttraining. Uh so I've referred back to this blog post a few times and so there was these
limitations and opportunities and we've actually covered the opportunities. It's this idea of
memorization syncs, seed
conditioning, which is like prepending the random uh text and multi-token learning. Um
yeah, you've hinted at some future directions for your research, but talk a little bit more
broadly about like the
Future directions
direction that you see these various eﬀorts going. Yeah, I think a lot of like we we really
want to scale up a lot
of these things and to see and to both you know for ourselves but also convince people
that these are the interventions
that are worth investing for training their you know future models uh and especially this
adaptability part like I
you know I often think like how do people keep their models fresh like right now we're at
a point where
everyone is training new models every year and so like maybe we haven't thought about
this issue but at some point we're like kind of not going to be
able to do that and I think the the trauma man answer here is like just do retrieval like that
gets you their latest facts and everything's okay and
we had this other paper that was an ordal at the previous conference where we kind of
show how that models are not
going to be that good at using the context and overriding its parametric information. So
this is not really a
magic solution to keeping the models uh sort of updated. So I think we're trying to like I
feel like the the aspect
that's like kind of really interesting to think about is like how do we actually make models
that are easy to update like what's the right way to
decompose or disentangle these aspects of what should be preserved like what should
be updated. So I think I'm really
excited about kind of that aspect and um I'm also you know really excited about scaling
up these ideas for improving
diversity creative generations and we're all like we all have like you know we're looking at
things like theorem improvingand you know trying to build systems that like help mathematicians and I feel like every
time I talk to all of these
people who want to use LLMs I keep coming back like how do we make sure models can
actually search and find creative things like for example finding
counter examples like we can use LLMs they would be great but how do we venture they
find kind of struct that
kind of structured exploration like finding creative counter examples in some way. So I I
would be very excited
about using these ideas in like all of these diﬀerent applications that I think uh you know
are top of mind for
people right now in terms of the interesting applications that can really push uh the
frontiers here across
various notions of science. Um so those are kind of the things that we're thinking about
and of course all through
all of these we are I think we spoke a little bit about the the fact of trying to understand
these models and I think
um a lot of our experiments are also trying to less be like here is a state-of-the-art method
that gets you
know high numbers on this but really hopefully give some objectives that stand the test of
time in terms of like
showing you new understanding about the fundamental properties that go beyond
specific data sets or specific you know
training um decisions that you might and that would help in guiding kind of the next
generation that we try to try to
train. Um so we are continuing our eﬀorts along that axis as well. Well GT thank you so
much for sharing a
bit about your research is very interesting stuﬀ. Yeah, thank you so much. And uh yeah, I
kind of wanted to
especially sort of plug a little bit that I want more people thinking about trying to
understand these models
because we really like need a lot of work there. And I think you know it's most it's like a
scientific questionwhere these are complex systems and we really have to think a bit like a scientist setting
up the right controlled experiments make formal
hypothesis test them out uh and there's like a huge um sort of opportunity here and I
think that will really unlock like
how we further push models especially as people are starting to see maybe diminishing
gains from you know just
pushing our current paradigm and so like kind of I think there's a lot of opportunity uh
there and so hopefully we
can have a bigger community looking up these aspects. Awesome. Very good. Very good.
Well,
thank you very much. Thank you.
[Music]
• https://arxiv.org/pdf/2504.15266
• https://arxiv.org/pdf/2503.19206
• https://arxiv.org/pdf/2507.09937
• https://sites.google.com/view/moss2025/home?authuser=0
• https://dataworldicml2025.github.io/index.html
• https://arxiv.org/pdf/2411.04330
• https://arxiv.org/pdf/2504.10478
• https://arxiv.org/abs/2402.00838
• https://arxiv.org/pdf/2307.09288
• LAMA 3 pdf…!!!
• https://arxiv.org/abs/2410.10796
• https://arxiv.org/pdf/2502.10517
• https://transformer-circuits.pub/2025/attribution-graphs/methods.html